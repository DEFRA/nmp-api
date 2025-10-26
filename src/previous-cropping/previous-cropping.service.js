const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { MoreThan } = require("typeorm");
const { UpdateRecommendationChanges } = require("../shared/updateRecommendationsChanges");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");

class PreviousCroppingService extends BaseService {
  constructor() {
    super(PreviousCroppingEntity);
    this.repository = AppDataSource.getRepository(PreviousCroppingEntity);
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.UpdateRecommendation = new UpdateRecommendation();
  }

  async mergePreviousCropping(previousCroppingBody, userId,request) {
  return await AppDataSource.transaction(async (transactionalManager) => {
    let previousCroppingData = null;
    previousCroppingBody.sort((a, b) => a.HarvestYear - b.HarvestYear);
     // Get the field and greatest year
      let MaxYear = Math.max(
        ...previousCroppingBody.map((item) => item.HarvestYear)
      );
      let MinYear = Math.min(
        ...previousCroppingBody.map((item) => item.HarvestYear)
      );
      let greatestYearField = previousCroppingBody[0].FieldID;
      
    for (const crop of previousCroppingBody) {
      if (crop.ID == null) {        
        const cropData = this.repository.create({
                ...crop,
               CreatedByID: userId,
        CreatedOn: new Date(),
              });
              previousCroppingData = await transactionalManager.save(PreviousCroppingEntity, cropData);          
      } else {
        const { HarvestYear, ID, FieldID, CreatedByID, CreatedOn, ...updatedData } =
                crop;        
              
             previousCroppingData= await transactionalManager.update(
                PreviousCroppingEntity,
                ID,
                {
                  ...updatedData,
                  ModifiedByID: userId,
                  ModifiedOn: new Date(),
                }
              );        
      }
    }

 const cropExist = await this.cropRepository.findOne({
        where: {
          FieldID: greatestYearField,
          Year: MaxYear + 1, // Find the next available year greater than the current MaxYear
        },
      });
      if (cropExist != null) {
        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          greatestYearField,
          MaxYear + 1,
          request,
          userId,
          transactionalManager
        );
      }

            // Check if there are any records in the repository for crop.FieldID with a year greater than crop.Year
            const nextAvailableCrop = await this.cropRepository.findOne({
        where: {
          FieldID: greatestYearField,
          Year: MoreThan(MinYear), // Find the next available year greater than the current MinYear
        },
        order: {
          Year: "ASC", // Ensure we get the next immediate year
        },
      });
      if (nextAvailableCrop) {
        this.UpdateRecommendation.updateRecommendationsForField(
          greatestYearField,
          nextAvailableCrop.Year,
          request,
          userId
        )
                .then((res) => {
                  if (res === undefined) {
                    console.log(
                      "updateRecommendationAndOrganicManure returned undefined"
                    );
                  } else {
                    console.log(
                      "updateRecommendationAndOrganicManure result:",
                      res
                    );
                  }
                })
                .catch((error) => {
                  console.error(
                    "Error updating recommendation:",
                    error
                  );
                });
            }

    

    // Return a boolean indicating if any data was saved/updated
    return previousCroppingData != null;
  });
}

  async getPreviousCroppingDataByFieldIdAndYear(fieldId, year) {
    const previousCroppingData = await this.repository.findOne({
      where: {
        FieldID: fieldId,
        HarvestYear: year,
      },
    });
    console.log("previousCroppingData", previousCroppingData);
    return { PreviousCropping: previousCroppingData };
  }
}

module.exports = { PreviousCroppingService };
