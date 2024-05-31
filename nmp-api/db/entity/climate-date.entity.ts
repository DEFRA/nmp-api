import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ClimateDatas' })
export default class ClimateDataEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column()
  Territory: string;

  @Column()
  PostCode: string;

  @Column('decimal', { precision: 18, scale: 9 })
  Altitude: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainDaysMeanDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  WindSpeedMeanDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  RainFallMeanDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MaxMeanDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  SunHoursMeanDec: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanJan: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanFeb: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanMar: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanApr: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanMay: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanJun: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanJul: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanAug: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanSep: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanOct: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanNov: number;

  @Column('decimal', { precision: 18, scale: 9 })
  MinTempMeanDec: number;
}
