import { Injectable } from '@nestjs/common'
import { MappedData } from '@island.is/content-search-indexer/types'
import { logger } from '@island.is/logging'
import {
  IManual,
  IManualChapter,
  IOneColumnText,
} from '../../generated/contentfulTypes'
import { CmsSyncProvider, processSyncDataInput } from '../cmsSync.service'
import { createTerms, extractStringsFromObject } from './utils'
import { isManual } from './manual.service'
import { mapManualChapterItem } from '../../models/manualChapterItem.model'

@Injectable()
export class ManualChapterItemSyncService implements CmsSyncProvider<IManual> {
  processSyncData(entries: processSyncDataInput<IManual>) {
    logger.info('Processing sync data for manual chapter items')

    // only process manuals that contain chapter items
    return entries.filter((entry) => {
      return (
        isManual(entry) &&
        entry.fields.chapters.length > 0 &&
        entry.fields.chapters.some(
          (chapter) =>
            chapter.fields.title &&
            chapter.fields.slug &&
            chapter.fields.chapterItems &&
            chapter.fields.chapterItems.length > 0,
        )
      )
    })
  }

  doMapping(entries: IManual[]) {
    // Gather all chapter items (assuming that no chapter item is reused between manuals)
    const chapterItems: {
      item: IOneColumnText
      manual: IManual
      chapter: IManualChapter
    }[] = []
    for (const manual of entries) {
      for (const chapter of manual.fields.chapters) {
        for (const item of chapter.fields.chapterItems ?? []) {
          chapterItems.push({
            item,
            manual,
            chapter,
          })
        }
      }
    }

    logger.info('Mapping manuals chapter items', {
      count: chapterItems.length,
    })

    return chapterItems
      .map<MappedData | boolean>(({ item, manual, chapter }) => {
        try {
          const mapped = mapManualChapterItem({
            item,
            manual,
            chapter,
          })

          const content = extractStringsFromObject(mapped.content ?? [])

          return {
            _id: mapped.id,
            title: mapped.title,
            content,
            contentWordCount: content.split(/\s+/).length,
            type: 'webManualChapterItem',
            termPool: createTerms([mapped.title]),
            response: JSON.stringify({
              ...mapped,
              typename: 'ManualChapterItem',
            }),
            dateCreated: item.sys.createdAt,
            dateUpdated: new Date().getTime().toString(),
            tags: [
              {
                key: manual.sys.id,
                type: 'referencedBy',
                value: manual.fields.title,
              },
            ],
          }
        } catch (error) {
          logger.warn('Failed to import manual chapter item', {
            error: error.message,
            id: item?.sys?.id,
          })
          return false
        }
      })
      .filter((value): value is MappedData => Boolean(value))
  }
}