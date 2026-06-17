import { Platform } from './platform.enum';
import { PostType } from './post-type.enum';

export enum PostFormat {
  // Instagram · Criativo
  CAPA_REELS = 'capa_reels',
  POST_UNICO = 'post_unico',
  GALERIA = 'galeria',
  STORY_FOTOS = 'story_fotos',
  STORY_INFORMATIVO = 'story_informativo',
  // Instagram · Vídeo
  REELS = 'reels',
  REELS_MOBILE = 'reels_mobile',
  VIDEO_GALERIA = 'video_galeria',
  // WhatsApp · Criativo
  ARTE_INFORMATIVA = 'arte_informativa',
  CAPA_VIDEO = 'capa_video',
  // WhatsApp · Vídeo
  VIDEO_INFORMATIVO = 'video_informativo',
  // YouTube · Criativo
  TEMPLATE_VIDEO = 'template_video',
  CAPA_YOUTUBE = 'capa_youtube',
  // YouTube · Vídeo
  SAMEDAY = 'sameday',
  CONCEITO = 'conceito',
}

/**
 * Which formats are valid for each platform + type. A post's format must belong
 * to its platform/type combination (validated on create/update).
 */
export const FORMATS_BY_PLATFORM_TYPE: Record<
  Platform,
  Record<PostType, PostFormat[]>
> = {
  [Platform.INSTAGRAM]: {
    [PostType.CRIATIVO]: [
      PostFormat.CAPA_REELS,
      PostFormat.POST_UNICO,
      PostFormat.GALERIA,
      PostFormat.STORY_FOTOS,
      PostFormat.STORY_INFORMATIVO,
    ],
    [PostType.VIDEO]: [
      PostFormat.REELS,
      PostFormat.REELS_MOBILE,
      PostFormat.VIDEO_GALERIA,
    ],
  },
  [Platform.WHATSAPP]: {
    [PostType.CRIATIVO]: [PostFormat.ARTE_INFORMATIVA, PostFormat.CAPA_VIDEO],
    [PostType.VIDEO]: [PostFormat.VIDEO_INFORMATIVO],
  },
  [Platform.YOUTUBE]: {
    [PostType.CRIATIVO]: [PostFormat.TEMPLATE_VIDEO, PostFormat.CAPA_YOUTUBE],
    [PostType.VIDEO]: [PostFormat.SAMEDAY, PostFormat.CONCEITO],
  },
};

export function isFormatValidFor(
  platform: Platform,
  type: PostType,
  format: PostFormat,
): boolean {
  return FORMATS_BY_PLATFORM_TYPE[platform][type].includes(format);
}
