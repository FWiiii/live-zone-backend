import type {
  LiveCategory,
  LiveCategoryResult,
  LivePlayQuality,
  LiveRoomDetail,
  LiveSearchAnchorResult,
  LiveSearchRoomResult,
  LiveSubCategory,
} from '../types/siteType'

abstract class LiveSite {
  // 站点唯一ID
  abstract id: string

  // 站点名称
  abstract name: string

  // 读取网站的分类
  abstract getCategories(): Promise<LiveCategory[]>

  // 搜索直播间
  abstract searchRooms(keyword: string, page: number): Promise<LiveSearchRoomResult>

  // 搜索主播
  abstract searchAnchors(keyword: string, page: number): Promise<LiveSearchAnchorResult>

  // 读取类目下房间
  abstract getCategoryRooms(category: LiveSubCategory, page: number): Promise<LiveCategoryResult>

  // 读取推荐的房间
  abstract getRecommendRooms(page: number): Promise<LiveCategoryResult>

  // 读取房间详情
  abstract getRoomDetail({ roomId }: { roomId: string }): Promise<LiveRoomDetail>

  // 读取房间清晰度
  abstract getPlayQualites({ detail }: { detail: LiveRoomDetail }): Promise<LivePlayQuality[]>

  // 读取播放链接
  abstract getPlayUrls({ detail, quality }: { detail: LiveRoomDetail, quality: LivePlayQuality }): Promise<string[]>

  // 查询直播状态
  abstract getLiveStatus({ roomId }: { roomId: string }): Promise<boolean>
}

export default LiveSite
