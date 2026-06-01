const organicManureCreateHelperMethods = {
  getFuturePlanStatus(
    isSoilAnalysisHavePAndK,
    fieldData,
    cropData,
    createContext,
  ) {
    const status = {
      isNextYearPlanExist: false,
      isNextYearOrganicManureExist: false,
      isNextYearFertiliserExist: false,
    };

    if (!isSoilAnalysisHavePAndK) {
      return status;
    }

    const cropPlanForNextYear = createContext.cropPlanAllData?.filter(
      (cropPlan) =>
        cropPlan.FieldID === fieldData.ID && cropPlan.Year > cropData.Year,
    );

    if (cropPlanForNextYear.length === 0) {
      return status;
    }

    status.isNextYearPlanExist = true;
    this.updateFuturePlanStatus(status, cropPlanForNextYear, createContext);

    return status;
  },

  updateFuturePlanStatus(status, cropPlanForNextYear, createContext) {
    for (const crop of cropPlanForNextYear) {
      console.log("CropID", crop.ID);
      const managementPeriodDataId = createContext.managementPeriodAllData
        ?.filter((manData) => manData.CropID === crop.ID)
        .map((manData) => manData.ID);
      console.log("managementPeriodDataId", managementPeriodDataId);
      this.updateRelatedFutureDataStatus(
        status,
        managementPeriodDataId,
        createContext,
      );
    }
  },

  updateRelatedFutureDataStatus(
    status,
    managementPeriodDataId,
    createContext,
  ) {
    if (managementPeriodDataId.length === 0) {
      return;
    }

    const filterOrganicManure = createContext.organicManureAllData?.filter(
      (organicData) =>
        organicData.ManagementPeriodID === managementPeriodDataId[0],
    );
    console.log("organicManureId", filterOrganicManure);
    const filterFertiliserData = createContext.fertiliserAllData?.filter(
      (fertData) => fertData.ManagementPeriodID === managementPeriodDataId[0],
    );
    console.log("fertiliserId", filterFertiliserData);

    if (filterOrganicManure != null && filterOrganicManure.length > 0) {
      console.log("filterOrganicManure", filterFertiliserData);
      status.isNextYearOrganicManureExist = true;
    }
    if (filterFertiliserData != null && filterFertiliserData.length > 0) {
      console.log("filterOrganicManure", filterFertiliserData);
      status.isNextYearFertiliserExist = true;
    }
  },
};

module.exports = { organicManureCreateHelperMethods };
