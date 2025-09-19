import axios from "axios";

export interface VideoInfo {
  title: string | null;
  description: string | null;
  chapters: string[] | null;
  musics: string[] | null;
  firstComment: string | null;
}

async function extractYtInitialData(videoUrl: string) {

  const { data: html } = await axios.get(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const match = html.match(/var ytInitialData = (\{[\s\S]*?\});/);

  if (!match || !match[1]) {
    throw new Error('Could not find ytInitialData.');
  }

  let dataObject
  try {
    dataObject = JSON.parse(match[1]) || null;
  } catch (error) {
    throw new Error('Could not parse ytInitialData.');
  }

  const continuationToken = findFirstNode(dataObject, "continuationCommand")?.token || null;
  // contiuationToken is needed to get comments
  return { ytInitialData: dataObject, continuationToken };
}

// Get youtube scroll data which normally contains  the comment section
async function getNextData(continuationToken: string) {
  try {
    const { data } = await axios.post("https://www.youtube.com/youtubei/v1/next",
      {
        context: {
          client: {
            hl: "en",
            gl: "VN",
            clientName: "WEB",
            clientVersion: "2.20250915.00.00"
          }
        },
        continuation: continuationToken
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": "2.20250915.00.00"
        }
      }
    )
    return data
  } catch (error) {
    console.log("Error fetching Youtube Next data: ", error)
    return null
  }
}

async function getVideoInformation(videoUrl: string): Promise<VideoInfo> {
  const rawInfo = await extractYtInitialData(videoUrl);
  if (!rawInfo.ytInitialData)
    throw new Error("ytInitialData is not provided")

  const title = getTitleFromYtInitialData(rawInfo.ytInitialData);
  const description = getDescriptionFromInitialData(rawInfo.ytInitialData)
  const chapters = getChaptersFromInitialData(rawInfo.ytInitialData)
  const musics = getIncludedMusicFromInitialData(rawInfo.ytInitialData)

  let firstComment;
  if (rawInfo.continuationToken) {
    const ytNextData = await getNextData(rawInfo.continuationToken)
    firstComment = getFirstComments(ytNextData)[0];
  }

  if (!description && !chapters && !musics || !firstComment)
    throw new Error("Couldn't get video information!")

  return { title, description, chapters, musics, firstComment }
}

// Ultilities functions to extract data from ytInitialData
function getFirstComments(nextDataObject: any) {
  const rawCommentsData = findNodes(nextDataObject?.frameworkUpdates, "commentEntityPayload")
  if (!rawCommentsData || rawCommentsData?.length === 0)
    return null

  const comments = rawCommentsData.map((item: any) => item?.properties?.content?.content ?? null)
  return comments
}

function getTitleFromYtInitialData(ytInitialData: any): string | null {

  // Path to title:
  // ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
  //  ?.contents?.find((c: any) => c.videoPrimaryInfoRenderer)
  //  ?.videoPrimaryInfoRenderer?.title?.runs?.[0]?.text || null;

  const videoPrimaryInfoRenderer = findFirstNode(ytInitialData?.contents, "videoPrimaryInfoRenderer")
  return videoPrimaryInfoRenderer?.title?.runs?.[0]?.text || null
}

function getDescriptionFromInitialData(ytInitialData: any): string | null {

  // Path to description:
  // ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
  //  ?.contents?.find((c: any) => c.videoSecondaryInfoRenderer)
  //  ?.videoSecondaryInfoRenderer?.attributedDescription?.content || null;

  const videoSecondaryInfoRenderer = findFirstNode(ytInitialData?.contents, "attributedDescription")
  return videoSecondaryInfoRenderer?.content || null
}

function getChaptersFromInitialData(ytInitialData: any): string[] | null {
  // Path to chapters:
  // ytInitialData?.playerOverlays
  //  ?.playerOverlayRenderer?.decoratedPlayerBarRenderer
  //  ?.decoratedPlayerBarRenderer
  //  ?.playerBar?.multiMarkersPlayerBarRenderer
  //  ?.markersMap[0]?.value?.chapters;

  const chapters = findFirstNode(ytInitialData?.playerOverlays, "chapters")
  if (!chapters || chapters?.length === 0)
    return null

  const extractedChapterTitles = chapters.map((item: any) => item?.chapterRenderer?.title?.simpleText) || null
  return extractedChapterTitles
}

function getIncludedMusicFromInitialData(ytInitialData: any): string[] | null {
  const horizontalCardListRenderer = findFirstNode(ytInitialData?.engagementPanels, "horizontalCardListRenderer")
  if (!horizontalCardListRenderer && horizontalCardListRenderer?.length === 0) {
    return null
  }

  const extractedTitles = horizontalCardListRenderer?.cards?.map((item: any) => item?.videoAttributeViewModel?.title) || null
  return extractedTitles
}

// This only find first occurrence
function findFirstNode(obj: any, key: string): any {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k === key) {
        return v;
      };
      const result = findFirstNode(v, key);
      if (result) return result
    }
  }

  return null;
}

function findNodes(obj: any, key: string): any {
  let result: any[] = []
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k === key) result.push(v)
      result = result.concat(findNodes(v, key))
    }
  }

  return result
}

export const YoutubeService = {
  extractYtInitialData,
  getTitleFromYtInitialData,
  getDescriptionFromInitialData,
  getChaptersFromInitialData,
  getIncludedMusicFromInitialData,
  getNextData, getFirstComments,
  getVideoInformation
}
