import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiCreatedResponse } from '@nestjs/swagger'

import { TokenGuard } from '@island.is/judicial-system/auth'

import { CreateEventLogDto } from './dto/createEventLog.dto'
import { EventLogService } from './eventLog.service'

@Controller('api/eventLog')
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  @UseGuards(TokenGuard)
  @Post('event')
  @ApiCreatedResponse({ description: 'Logs an event to event log' })
  logEvent(@Body() event: CreateEventLogDto): Promise<void> {
    return this.eventLogService.create(event)
  }
}
