// src/db/entity/climate-data.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ClimateDatabase' })
export default class ClimateDatabaseEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column()
  Territory: string;

  @Column()
  PostCode: string;

  @Column('int')
  East: number;

  @Column('int')
  North: number;

  @Column('decimal', { precision: 18, scale: 9 })
  Altitude: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMinDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanMaxDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanTotalRainFallDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanSunHoursDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanRainDaysDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MeanWindSpeedDec: number;
}
