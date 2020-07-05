(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d228c74"],{db44:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("a-row",{attrs:{gutter:12}},[a("a-col",{attrs:{span:24}},[a("div",{staticStyle:{"margin-bottom":"16px"}},[a("a-input",{attrs:{size:"large",placeholder:"请输入文章标题"},model:{value:t.postToStage.title,callback:function(e){t.$set(t.postToStage,"title",e)},expression:"postToStage.title"}})],1),a("div",{attrs:{id:"editor"}},[a("MarkdownEditor",{attrs:{originalContent:t.postToStage.originalContent},on:{onSaveDraft:function(e){return t.handleSaveDraft(!0)},onContentChange:t.onContentChange}})],1)])],1),a("PostSettingDrawer",{attrs:{post:t.postToStage,tagIds:t.selectedTagIds,categoryIds:t.selectedCategoryIds,metas:t.selectedMetas,visible:t.postSettingVisible},on:{close:t.onPostSettingsClose,onRefreshPost:t.onRefreshPostFromSetting,onRefreshTagIds:t.onRefreshTagIdsFromSetting,onRefreshCategoryIds:t.onRefreshCategoryIdsFromSetting,onRefreshPostMetas:t.onRefreshPostMetasFromSetting,onSaved:t.onSaved}}),a("AttachmentDrawer",{model:{value:t.attachmentDrawerVisible,callback:function(e){t.attachmentDrawerVisible=e},expression:"attachmentDrawerVisible"}}),a("footer-tool-bar",{style:{width:t.isSideMenu()&&t.isDesktop()?"calc(100% - "+(t.sidebarOpened?256:80)+"px)":"100%"}},[a("a-button",{attrs:{type:"danger",loading:t.draftSaving},on:{click:function(e){return t.handleSaveDraft(!1)}}},[t._v("保存草稿")]),a("a-button",{staticStyle:{"margin-left":"8px"},attrs:{loading:t.previewSaving},on:{click:t.handlePreview}},[t._v("预览")]),a("a-button",{staticStyle:{"margin-left":"8px"},attrs:{type:"primary"},on:{click:t.handleShowPostSetting}},[t._v("发布")]),a("a-button",{staticStyle:{"margin-left":"8px"},attrs:{type:"dashed"},on:{click:function(e){t.attachmentDrawerVisible=!0}}},[t._v("附件库")])],1)],1)},o=[],s=a("ac0d"),i=a("35f4"),r=a.n(i),d=a("86db"),l=a("ed4e"),c=a("5a70"),g=a("fa70"),h=a("caf6"),u={mixins:[s["a"],s["b"]],components:{PostSettingDrawer:d["a"],FooterToolBar:c["a"],AttachmentDrawer:l["a"],MarkdownEditor:g["a"]},data:function(){return{attachmentDrawerVisible:!1,postSettingVisible:!1,postToStage:{},selectedTagIds:[],selectedCategoryIds:[],selectedMetas:[],isSaved:!1,contentChanges:0,draftSaving:!1,previewSaving:!1}},beforeRouteEnter:function(t,e,a){var n=t.query.postId;a((function(t){n&&h["a"].get(n).then((function(e){var a=e.data.data;t.postToStage=a,t.selectedTagIds=a.tagIds,t.selectedCategoryIds=a.categoryIds,t.selectedMetas=a.metas}))}))},destroyed:function(){this.postSettingVisible&&(this.postSettingVisible=!1),this.attachmentDrawerVisible&&(this.attachmentDrawerVisible=!1),window.onbeforeunload&&(window.onbeforeunload=null)},beforeRouteLeave:function(t,e,a){this.$createElement;this.postSettingVisible&&(this.postSettingVisible=!1),this.attachmentDrawerVisible&&(this.attachmentDrawerVisible=!1),this.contentChanges<=1||this.isSaved?a():this.$confirm({title:"当前页面数据未保存，确定要离开吗？",content:function(t){return t("div",{style:"color:red;"},["如果离开当面页面，你的数据很可能会丢失！"])},onOk:function(){a()},onCancel:function(){a(!1)}})},mounted:function(){window.onbeforeunload=function(t){return t=t||window.event,t&&(t.returnValue="当前页面数据未保存，确定要离开吗？"),"当前页面数据未保存，确定要离开吗？"}},watch:{temporaryContent:function(t,e){t&&this.contentChanges++}},computed:{temporaryContent:function(){return this.postToStage.originalContent}},methods:{handleSaveDraft:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.$log.debug("Draft only: "+e),this.postToStage.status="DRAFT",this.postToStage.title||(this.postToStage.title=r()(new Date).format("YYYY-MM-DD-HH-mm-ss")),this.draftSaving=!0,this.postToStage.id?e?h["a"].updateDraft(this.postToStage.id,this.postToStage.originalContent).then((function(e){t.$message.success("保存草稿成功！")})).finally((function(){t.draftSaving=!1})):h["a"].update(this.postToStage.id,this.postToStage,!1).then((function(e){t.$log.debug("Updated post",e.data.data),t.$message.success("保存草稿成功！"),t.postToStage=e.data.data})).finally((function(){t.draftSaving=!1})):h["a"].create(this.postToStage,!1).then((function(e){t.$log.debug("Created post",e.data.data),t.$message.success("保存草稿成功！"),t.postToStage=e.data.data})).finally((function(){t.draftSaving=!1}))},handleShowPostSetting:function(){this.postSettingVisible=!0},handlePreview:function(){var t=this;this.postToStage.status="DRAFT",this.postToStage.title||(this.postToStage.title=r()(new Date).format("YYYY-MM-DD-HH-mm-ss")),this.previewSaving=!0,this.postToStage.id?h["a"].update(this.postToStage.id,this.postToStage,!1).then((function(e){t.$log.debug("Updated post",e.data.data),h["a"].preview(t.postToStage.id).then((function(t){window.open(t.data,"_blank")})).finally((function(){t.previewSaving=!1}))})):h["a"].create(this.postToStage,!1).then((function(e){t.$log.debug("Created post",e.data.data),t.postToStage=e.data.data,h["a"].preview(t.postToStage.id).then((function(t){window.open(t.data,"_blank")})).finally((function(){t.previewSaving=!1}))}))},onContentChange:function(t){this.postToStage.originalContent=t},onPostSettingsClose:function(){this.postSettingVisible=!1},onRefreshPostFromSetting:function(t){this.postToStage=t},onRefreshTagIdsFromSetting:function(t){this.selectedTagIds=t},onRefreshCategoryIdsFromSetting:function(t){this.selectedCategoryIds=t},onRefreshPostMetasFromSetting:function(t){this.selectedMetas=t},onSaved:function(t){this.isSaved=t}}},f=u,p=a("9ca4"),S=Object(p["a"])(f,n,o,!1,null,null,null);e["default"]=S.exports}}]);