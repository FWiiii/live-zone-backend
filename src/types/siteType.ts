export interface LiveCategory {
  name: string
  id: string
  children: LiveSubCategory[]
}

export interface LiveSubCategory {
  name: string
  pic?: string
  id: string
  parentId: string
}

export interface LiveSearchRoomResult {
  hasMore: boolean
  items: LiveRoomItem[]
}

export interface LiveRoomItem {
  roomId: string
  /// 标题
  title: string
  /// 封面
  cover: string
  /// 用户名
  userName: string
  /// 人气/在线人数
  online: number
}

export interface LiveSearchAnchorResult {
  hasMore: boolean
  items: LiveAnchorItem[]
}

export interface LiveAnchorItem {
  /// 房间ID
  roomId: string
  /// 封面
  avatar: string
  /// 用户名
  userName: string
  /// 直播中
  liveStatus: boolean
}

export interface LiveCategoryResult {
  hasMore: boolean
  items: LiveRoomItem[]
}

export interface LiveRoomDetail {
  roomId: string
  /// 房间标题
  title: string
  /// 封面
  cover: string
  /// 用户名
  userName: string
  /// 头像
  userAvatar: string
  /// 在线
  online: number
  /// 介绍
  introduction?: string
  /// 公告
  notice?: string
  /// 状态
  status: boolean
  /// 附加信息
  data?: any
  /// 是否录播
  isRecord?: boolean
  /// 链接
  url: string
}

export interface LivePlayQuality {
  quality: string
  /// 清晰度信息
  data: any
  sort: number

}
