import axios from "axios";

async function extractYtInitialData(videoUrl: string) {

  const { data: html } = await axios.get(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const match = html.match(/var ytInitialData = (.*?);/);

  if (!match || !match[1]) {
    throw new Error('Could not find ytInitialData.');
  }

  const dataObject = JSON.parse(match[1]);

  return dataObject;
}

// Ultilities functions to extract data from ytInitialData
function getTitleFromYtInitialData(ytInitialData: any): string | null {
  return ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
    ?.contents?.find((c: any) => c.videoPrimaryInfoRenderer)
    ?.videoPrimaryInfoRenderer?.title?.runs?.[0]?.text || null;
}

function getDescriptionsFromInitialData(ytInitialData: any): any {
  return ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
    ?.contents?.find((c: any) => c.videoSecondaryInfoRenderer)
    ?.videoSecondaryInfoRenderer?.attributedDescription?.content || null;
}

function getChaptersFromInitialData(ytInitialData: any): any {
  const chapterData = ytInitialData?.playerOverlays
    ?.playerOverlayRenderer?.decoratedPlayerBarRenderer
    ?.decoratedPlayerBarRenderer
    ?.playerBar?.multiMarkersPlayerBarRenderer
    ?.markersMap[0]?.value?.chapters;

  const extractedChapterTitles = chapterData.map((item: any) => item?.chapterRenderer?.title?.simpleText)
  return extractedChapterTitles
}

function findNode(obj: any, key: string): any[] {
  let results: any[] = [];
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (k === key) results.push(v);
      results = results.concat(findNode(v, key));
    }
  }
  return results
}

export const YoutubeService = {
  extractYtInitialData,
  getTitleFromYtInitialData,
  getDescriptionsFromInitialData,
  getChaptersFromInitialData
}
