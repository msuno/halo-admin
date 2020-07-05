import axios from 'axios'
import service from '@/utils/service'

const baseUrl = '/api/admin/attachments'

const attachmentApi = {}

attachmentApi.query = params => {
  return service({
    url: baseUrl,
    params: params,
    method: 'get'
  })
}

attachmentApi.get = attachmentId => {
  return service({
    url: `${baseUrl}/${attachmentId}`,
    method: 'get'
  })
}

attachmentApi.delete = attachmentId => {
  return service({
    url: `${baseUrl}/${attachmentId}`,
    method: 'delete'
  })
}

attachmentApi.deleteInBatch = attachmentIds => {
  return service({
    url: `${baseUrl}`,
    method: 'delete',
    data: attachmentIds,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

attachmentApi.update = (attachmentId, attachment) => {
  return service({
    url: `${baseUrl}/${attachmentId}`,
    method: 'put',
    data: attachment
  })
}

attachmentApi.getMediaTypes = () => {
  return service({
    url: `${baseUrl}/media_types`,
    method: 'get'
  })
}

attachmentApi.getTypes = () => {
  return service({
    url: `${baseUrl}/types`,
    method: 'get'
  })
}

attachmentApi.CancelToken = axios.CancelToken
attachmentApi.isCancel = axios.isCancel

attachmentApi.upload = (formData, uploadProgress, cancelToken, filed, file, ossType) => {
  if (ossType === attachmentApi.type.QINIUOSS.type) {
    return attachmentApi.ossQinUpload(formData, uploadProgress, cancelToken, file)
  } else if (ossType === attachmentApi.type.TENCENTCOS.type) {
    return attachmentApi.ossTenUpload(uploadProgress, cancelToken, file)
  } else {
    return service({
      url: `${baseUrl}/upload`,
      timeout: 8640000, // 24 hours
      data: formData, // form data
      onUploadProgress: uploadProgress,
      cancelToken: cancelToken,
      method: 'post'
    })
  }
}

attachmentApi.uploads = (formDatas, uploadProgress, cancelToken) => {
  return service({
    url: `${baseUrl}/uploads`,
    timeout: 8640000, // 24 hours
    data: formDatas, // form data
    onUploadProgress: uploadProgress,
    cancelToken: cancelToken,
    method: 'post'
  })
}

attachmentApi.ossQinUpload = async(formData, uploadProgress, cancelToken, file) => {
  const data = await service({
    url: `${baseUrl}/token`,
    method: 'post'
  })
  const token = data.data.data.token
  const basePath = data.data.data.basePath
  const fileName = file.name
  formData.append('name', fileName)
  formData.append('key', basePath + fileName)
  formData.append('token', token)
  const ajax = axios.create()
  const result = await ajax({
    url: 'http://upload-z2.qiniup.com',
    data: formData,
    method: 'post',
    onUploadProgress: uploadProgress,
    cancelToken: cancelToken
  })
  result.data.suffix = result.data.suffix ? result.data.suffix.replace('.', '') : result.data.suffix
  return attachmentApi.saveUpload(result.data)
}

attachmentApi.ossTenUpload = async(uploadProgress, cancelToken, file) => {
  const data = await service({
    url: `${baseUrl}/token`,
    method: 'post'
  })
  const fileName = file.name
  const basePath = data.data.data.basePath
  const host = data.data.data.host
  const formData = new FormData()
  const key = basePath + fileName
  formData.append('key', key)
  formData.append('policy', data.data.data['policy'])
  formData.append('q-sign-algorithm', data.data.data['q-sign-algorithm'])
  formData.append('q-ak', data.data.data['q-ak'])
  formData.append('q-key-time', data.data.data['q-key-time'])
  formData.append('q-signature', data.data.data['q-signature'])
  formData.append('file', file)
  const ajax = axios.create()
  const result = await ajax({
    url: host,
    data: formData,
    method: 'post',
    onUploadProgress: uploadProgress,
    cancelToken: cancelToken,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  const index = fileName.lastIndexOf('.')
  let suffix = 'png'
  if (index > 0) {
    suffix = fileName.substr(index + 1)
  }
  if (result.status === 204) {
    const attachment = {
      filename: fileName,
      filePath: host + key,
      key: key,
      thumbPath: '',
      suffix: suffix,
      mediaType: file.type,
      size: file.size,
      width: 0,
      height: 0
    }
    return attachmentApi.saveUpload(attachment)
  } else {
    return new Promise(result.data)
  }
}

attachmentApi.saveUpload = (data) => {
  const fd = new FormData()
  if (typeof (data.width) !== 'number') {
    data.width = 0
  }
  if (typeof (data.height) !== 'number') {
    data.height = 0
  }
  for (const d in data) {
    fd.append(d, data[d])
  }
  return service({
    url: `${baseUrl}/save`,
    data: fd,
    method: 'post'
  })
}

attachmentApi.type = {
  LOCAL: {
    type: 'LOCAL',
    text: '本地'
  },
  SMMS: {
    type: 'SMMS',
    text: 'SM.MS'
  },
  UPOSS: {
    type: 'UPOSS',
    text: '又拍云'
  },
  QINIUOSS: {
    type: 'QINIUOSS',
    text: '七牛云'
  },
  ALIOSS: {
    type: 'ALIOSS',
    text: '阿里云'
  },
  BAIDUBOS: {
    type: 'BAIDUBOS',
    text: '百度云'
  },
  TENCENTCOS: {
    type: 'TENCENTCOS',
    text: '腾讯云'
  },
  HUAWEIOBS: {
    type: 'HUAWEIOBS',
    text: '华为云'
  }
}

export default attachmentApi
