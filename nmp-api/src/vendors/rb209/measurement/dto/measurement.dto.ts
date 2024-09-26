import { ApiProperty } from '@nestjs/swagger';

class Step1ArablePotato {
  @ApiProperty()
  depth0To30Cm: number;

  @ApiProperty()
  depth30To60Cm: number;

  @ApiProperty()
  depth60To90Cm: number;
}

class Step1Veg {
  @ApiProperty()
  depthCm: number;

  @ApiProperty()
  depthValue: number;
}

class Step2 {
  @ApiProperty()
  shootNumber: number;

  @ApiProperty()
  greenAreaIndex: number;

  @ApiProperty()
  cropHeight: number;
}

class Step3 {
  @ApiProperty()
  adjustment: number;

  @ApiProperty()
  organicMatterPercentage: number;
}

export class CalculateSnsIndexRequest {
  @ApiProperty()
  cropTypeId: number;

  @ApiProperty()
  seasonId: number;

  @ApiProperty()
  step1ArablePotato: Step1ArablePotato;

  @ApiProperty()
  step1Veg: Step1Veg;

  @ApiProperty()
  step2: Step2;

  @ApiProperty()
  step3: Step3;
}
