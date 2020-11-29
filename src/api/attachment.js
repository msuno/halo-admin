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
  console.log(ossType)
  if (ossType === attachmentApi.type.QINIUOSS.type) {
    return attachmentApi.ossQinUpload(uploadProgress, cancelToken, file)
  } else if (ossType === attachmentApi.type.TENCENTCOS.type) {
    return attachmentApi.ossTenUpload(uploadProgress, cancelToken, file)
  } else if (ossType === attachmentApi.type.MINIO.type) {
    return attachmentApi.ossMinioUpload(uploadProgress, cancelToken, file)
  } else if (ossType === attachmentApi.type.UPOSS.type) {
    return attachmentApi.ossUpUpload(uploadProgress, cancelToken, file)
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

attachmentApi.ossUpUpload = async(uploadProgress, cancelToken, file) => {
  const data = await service({
    url: `${baseUrl}/token`,
    method: 'post'
  })
  const bucket = data.data.data.bucket
  const policy = data.data.data.policy
  const signature = data.data.data.signature
  const fileName = file.name
  const host = data.data.data.host
  const formData = new FormData()
  formData.append('file', file)
  formData.append('policy', policy)
  formData.append('authorization', signature)
  const ajax = axios.create()
  const result = await ajax({
    url: 'http://v0.api.upyun.com/' + bucket,
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
  if (result.status === 200) {
    const attachment = {
      filename: fileName,
      filePath: host + '/' + result.data.url,
      key: result.data.url,
      thumbPath: '',
      suffix: suffix,
      mediaType: file.type,
      size: file.size,
      width: result.data['image-width'] || 0,
      height: result.data['image-height'] || 0
    }
    return attachmentApi.saveUpload(attachment)
  } else {
    return new Promise(result.data)
  }
}

attachmentApi.ossQinUpload = async(uploadProgress, cancelToken, file) => {
  const data = await service({
    url: `${baseUrl}/token`,
    method: 'post'
  })
  const token = data.data.data.token
  const basePath = data.data.data.basePath
  const fileName = file.name
  const formData = new FormData()
  formData.append('name', fileName)
  formData.append('key', basePath + fileName)
  formData.append('token', token)
  formData.append('file', file)
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

attachmentApi.ossMinioUpload = async(uploadProgress, cancelToken, file) => {
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
  formData.append('x-amz-algorithm', data.data.data['x-amz-algorithm'])
  formData.append('x-amz-credential', data.data.data['x-amz-credential'])
  formData.append('x-amz-date', data.data.data['x-amz-date'])
  formData.append('x-amz-signature', data.data.data['x-amz-signature'])
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
  let filePath
  if (host.endsWith('/')) {
    filePath = host + key
  } else {
    filePath = host + '/' + key
  }
  let thumbPath
  if (file.type.indexOf('image') > 0) {
    thumbPath = filePath
  } else {
    thumbPath = ''
  }
  if (result.status === 204) {
    const attachment = {
      filename: fileName,
      filePath: filePath,
      key: key,
      thumbPath: thumbPath,
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
    cancelToken: cancelToken
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
  },
  MINIO: {
    type: 'MINIO',
    text: 'MinIO'
  }
}

export default attachmentApi
