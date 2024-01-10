import axios from 'axios'
import type { LiveAnchorItem, LiveCategory, LiveCategoryResult, LivePlayQuality, LiveRoomDetail, LiveRoomItem, LiveSearchAnchorResult, LiveSearchRoomResult, LiveSubCategory } from 'src/types/siteType'
import LiveSite from './base'

class BilibiliSite extends LiveSite {
  id = 'bilibili'
  name = '哔哩哔哩直播'

  async getCategories(): Promise<LiveCategory[]> {
    const response = await axios.get('https://api.live.bilibili.com/room/v1/Area/getList', {
      params: {
        need_entrance: 1,
        parent_id: 0,
      },
    })
    const result = response.data.data
    const categories: LiveCategory[] = []
    result.forEach((item: any) => {
      const subs: LiveSubCategory[] = []
      item.list.forEach((subItem: any) => {
        subs.push({
          id: subItem.id,
          name: subItem.name ?? '',
          parentId: subItem.parent_id ?? '',
          pic: subItem.pic,
        })
      })
      categories.push({
        children: subs,
        id: item.id,
        name: item.name ?? '',
      })
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
    })
    const result = response.data.data
    const hasMore = result.has_more === 1
    const items: LiveRoomItem[] = []
    result.list.forEach((item: any) => {
      const roomItem = {
        roomId: item.roomid,
        title: item.title,
        cover: item.cover,
        userName: item.uname,
        online: item.online ?? 0,
      }
      items.push(roomItem)
    })

    return { hasMore, items }
  }

  async getPlayQualites(detail: LiveRoomDetail): Promise<LivePlayQuality[]> {
    const qualities: LivePlayQuality[] = []

    const response = await axios.get('https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo', {
      params: {
        room_id: detail.roomId,
        protocol: '0,1',
        format: '0,1,2',
        codec: '0,1',
        platform: 'web',
      },
    })
    const result = response.data
    const qualitiesMap: { [key: number]: string } = {}
    for (const item of result.data.playurl_info.playurl.g_qn_desc) {
      qualitiesMap[item.qn ?? 0]
          = item.desc
    }
    for (const item of result.data.playurl_info.playurl.stream[0]
      .format[0].codec[0].accept_qn) {
      const qualityItem: LivePlayQuality = {
        quality: qualitiesMap[item] ?? '未知清晰度',
        data: item,
        sort: 0,
      }
      qualities.push(qualityItem)
    }
    return qualities
  }

  async getRoomDetail(roomId: string): Promise<LiveRoomDetail> {
    const response = await axios.get('https://api.live.bilibili.com/xlive/web-room/v1/index/getH5InfoByRoom', {
      params: {
        room_id: roomId,
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
    const cookieRes = await axios.get('https://bilibili.com')
    const cookies = cookieRes.headers.get('set-cookie')
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
        cookie: cookies,
      },
    })
    const result = response.data
    const items: LiveRoomItem[] = []
    for (const item of result.data.result.live_room ?? []) {
      let title = item.title
      // 移除title中的<em></em>标签
      title = title.replace(/<em[^>]*>([^<]*)<\/em>/g, '$1')
      const roomItem: LiveRoomItem = {
        roomId: item.roomid,
        title,
        cover: `https:${item.cover}@400w.jpg`,
        userName: item.uname,
        online: item.online ?? 0,
      }
      items.push(roomItem)
    }
    return { hasMore: items.length >= 40, items }
  }

  async searchAnchors(keyword: string, page: number = 1): Promise<LiveSearchAnchorResult> {
    const cookieRes = await axios.get('https://bilibili.com')
    const cookies = cookieRes.headers.get('set-cookie')
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
        cookie: cookies,
      },
    })
    const result = response.data
    const items: LiveAnchorItem[] = []
    for (const item of result.data.result ?? []) {
      let uname = item.uname.toString()
      // 移除title中的<em></em>标签
      uname = uname.replace(/<em[^>]*>([^<]*)<\/em>/g, '$1')
      const anchorItem = {
        roomId: item.roomid.toString(),
        avatar: `https:${item.uface}@400w.jpg`,
        userName: uname,
        liveStatus: item.is_live,
      }
      items.push(anchorItem)
    }
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
      },
    )

    const result = response.data
    const hasMore = result.data.list.length > 0
    const items: LiveRoomItem[] = []
    for (const item of result.data.list) {
      const roomItem = {
        roomId: item.roomid,
        title: item.title,
        cover: `${item.cover}@400w.jpg`,
        userName: item.uname,
        online: item.online ?? 0,
      }
      items.push(roomItem)
    }
    return { hasMore, items }
  }

  async getPlayUrls(detail: LiveRoomDetail, quality: LivePlayQuality): Promise<string[]> {
    const urls: string[] = []
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
      },
    )

    const result = response.data

    const streamList = result.data.playurl_info.playurl.stream
    for (const streamItem of streamList) {
      const formatList = streamItem.format
      for (const formatItem of formatList) {
        const codecList = formatItem.codec
        for (const codecItem of codecList) {
          const urlList = codecItem.url_info
          const baseUrl = codecItem.base_url
          for (const urlItem of urlList) {
            urls.push(
              `${urlItem.host}${baseUrl}${urlItem.extra}`,
            )
          }
        }
      }
    }
    // 对链接进行排序，包含mcdn的在后
    urls.sort((a, _b) => {
      if (a.includes('mcdn'))
        return 1
      else
        return -1
    })
    return urls
  }

  async getLiveStatus(roomId: string): Promise<boolean> {
    const response = await axios.get(
      'https://api.live.bilibili.com/room/v1/Room/get_info',
      {
        params: {
          room_id: roomId,
        },
      },
    )
    const result = response.data
    return (result.data.live_status ?? 0) === 1
  }
}

export default BilibiliSite
