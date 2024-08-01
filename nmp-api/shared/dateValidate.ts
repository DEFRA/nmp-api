import { BadRequestException } from '@nestjs/common';

export function validateISODateFormat(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new BadRequestException(
      'Invalid date format. Use ISO string format.',
    );
  }
  return date;
}
