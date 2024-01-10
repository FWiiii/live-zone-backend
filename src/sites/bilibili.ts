import axios from 'axios'
import type { LiveAnchorItem, LiveCategory, LiveCategoryResult, LivePlayQuality, LiveRoomDetail, LiveRoomItem, LiveSearchAnchorResult, LiveSearchRoomResult, LiveSubCategory } from 'src/types/siteType'
import LiveSite from './base'

class BilibiliSite extends LiveSite {
  id = 'bilibili'
  name = '哔哩哔哩直播'
  cookies: any = []

  constructor() {
    super()
    this.getCookies()
  }

  getCookies() {
    axios.get('https://bilibili.com').then((res) => {
      const cookies = res.headers.get('set-cookie')
      if (cookies)
        this.cookies = cookies
    })
  }

  async getCategories(): Promise<LiveCategory[]> {
    const response = await axios.get('https://api.live.bilibili.com/room/v1/Area/getList', {
      params: {
        need_entrance: 1,
        parent_id: 0,
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data.data
    const categories: LiveCategory[] = result.map((item: any) => {
      const children = item.list.map((subItem: any) => ({
        id: subItem.id,
        name: subItem.name ?? '',
        parentId: subItem.parent_id ?? '',
        pic: subItem.pic,
      }))
      return {
        children,
        id: item.id,
        name: item.name ?? '',
      }
    })
    return categories
  }

  async getCategoryRooms(category: LiveSubCategory, page: number = 1): Promise<LiveCategoryResult> {
    const response = await axios.get('https://api.live.bilibili.com/xlive/web-interface/v1/second/getList', {
      params: {
        platform: 'web',
        parent_area_id: category.parentId,
        area_id: category.id,
        sort_type: '',
        page,
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data.data
    const hasMore = result.has_more === 1
    const items: LiveRoomItem[] = result.list.map((item: any) => ({
      roomId: item.roomid,
      title: item.title,
      cover: item.cover,
      userName: item.uname,
      online: item.online ?? 0,
    }))

    return { hasMore, items }
  }

  async getPlayQualites(detail: LiveRoomDetail): Promise<LivePlayQuality[]> {
    const response = await axios.get('https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo', {
      params: {
        room_id: detail.roomId,
        protocol: '0,1',
        format: '0,1,2',
        codec: '0,1',
        platform: 'web',
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data
    const qualitiesMap: { [key: number]: string } = {}
    for (const item of result.data.playurl_info.playurl.g_qn_desc) {
      qualitiesMap[item.qn ?? 0]
          = item.desc
    }
    const qualities: LivePlayQuality[] = result.data.playurl_info.playurl.stream[0].format[0].codec[0].accept_qn
      .map((item: any) => ({
        quality: qualitiesMap[item] ?? '未知清晰度',
        data: item,
        sort: 0,
      }))
    return qualities
  }

  async getRoomDetail(roomId: string): Promise<LiveRoomDetail> {
    const response = await axios.get('https://api.live.bilibili.com/xlive/web-room/v1/index/getH5InfoByRoom', {
      params: {
        room_id: roomId,
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data
    const realRoomId = result.data.room_info.room_id
    return {
      roomId: realRoomId,
      title: result.data.room_info.title,
      cover: result.data.room_info.cover,
      userName: result.data.anchor_info.base_info.uname,
      userAvatar: `${result.data.anchor_info.base_info.face}@100w.jpg`,
      online: result.data.room_info.online ?? 0,
      status: (result.data.room_info.live_status ?? 0) === 1,
      url: `https://live.bilibili.com/${roomId}`,
      introduction: result.data.room_info.description,
    }
  }

  async searchRooms(keyword: string, page: number = 1): Promise<LiveSearchRoomResult> {
    const response = await axios.get('https://api.bilibili.com/x/web-interface/search/type?context=&search_type=live&cover_type=user_cover', {
      params: {
        order: '',
        keyword,
        category_id: '',
        __refresh__: '',
        _extra: '',
        highlight: 0,
        single_column: 0,
        page,
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data
    const items: LiveRoomItem[] = (result.data.result.live_room ?? []).map((item: any) => {
      return {
        roomId: item.roomid,
        title: item.title.replace(/<em[^>]*>([^<]*)<\/em>/g, '$1'),
        cover: `https:${item.cover}@400w.jpg`,
        userName: item.uname,
        online: item.online ?? 0,
      }
    })
    return { hasMore: items.length >= 40, items }
  }

  async searchAnchors(keyword: string, page: number = 1): Promise<LiveSearchAnchorResult> {
    const response = await axios.get('https://api.bilibili.com/x/web-interface/search/type?context=&search_type=live_user&cover_type=user_cover', {
      params: {
        order: '',
        keyword,
        category_id: '',
        __refresh__: '',
        _extra: '',
        highlight: 0,
        single_column: 0,
        page,
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data
    const items: LiveAnchorItem[] = (result.data.result ?? []).map((item: any) => {
      return {
        roomId: item.roomid.toString(),
        avatar: `https:${item.uface}@400w.jpg`,
        userName: item.uname.replace(/<em[^>]*>([^<]*)<\/em>/g, '$1'),
        liveStatus: item.is_live,
      }
    })
    return { hasMore: items.length >= 40, items }
  }

  async getRecommendRooms(page: number = 1): Promise<LiveCategoryResult> {
    const response = await axios.get(
      'https://api.live.bilibili.com/xlive/web-interface/v1/second/getListByArea',
      {
        params: {
          platform: 'web',
          sort: 'online',
          page_size: 30,
          page,
        },
        headers: {
          cookie: this.cookies,
        },
      },
    )

    const result = response.data
    const hasMore = result.data.list.length > 0
    const items: LiveRoomItem[] = result.data.list.map((item: any) => ({
      roomId: item.roomid,
      title: item.title,
      cover: `${item.cover}@400w.jpg`,
      userName: item.uname,
      online: item.online ?? 0,
    }))
    return { hasMore, items }
  }

  async getPlayUrls(detail: LiveRoomDetail, quality: LivePlayQuality): Promise<string[]> {
    // const urls: string[] = []
    const response = await axios.get(
      'https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo',
      {
        params: {
          room_id: detail.roomId,
          protocol: '0,1',
          format: '0,2',
          codec: '0',
          platform: 'web',
          qn: quality.data,
        },
        headers: {
          cookie: this.cookies,
        },
      },
    )

    const result = response.data
    const streamList = result.data.playurl_info.playurl.stream
    const urls: string[] = streamList.flatMap((streamItem: { format: any[] }) =>
      streamItem.format.flatMap((formatItem: { codec: any[] }) =>
        formatItem.codec.flatMap((codecItem: { url_info: any[], base_url: any }) =>
          codecItem.url_info.map((urlItem: { host: any, extra: any }) =>
            `${urlItem.host}${codecItem.base_url}${urlItem.extra}`,
          ),
        ),
      ),
    )
    // 对链接进行排序，包含mcdn的在后
    urls.sort((a, _b) => (a.includes('mcdn') ? 1 : -1))
    return urls
  }

  async getLiveStatus(roomId: string): Promise<boolean> {
    const response = await axios.get('https://api.live.bilibili.com/room/v1/Room/get_info', {
      params: {
        room_id: roomId,
      },
      headers: {
        cookie: this.cookies,
      },
    })
    const result = response.data
    return (result.data.live_status ?? 0) === 1
  }
}

export default BilibiliSite
