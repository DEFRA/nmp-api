const { getRepository, In } = require("typeorm");
const {
  SecondCropLinkingEntity,
} = require("../db/entity/second-crop-linking.entity");

class SecondCropLinkingsService {
  constructor() {
    this.repository = getRepository(SecondCropLinkingEntity);
  }

  async getSecondCropTypeLinkingByFirstCropId(firstCropID,rB209CountryID) {
    try {
      // Query the repository to find the SecondCropID linked to the given FirstCropID
      const secondCropTypes = await this.repository.find({
        where: { FirstCropID: firstCropID,     RB209CountryID: In([3, rB209CountryID]) },        
        select: ["SecondCropID"], // Select only the SecondCropID field
      });

      // Extract SecondCropIDs from the result
      return secondCropTypes.map((item) => item.SecondCropID);
    } catch (error) {
      console.error("Error fetching Second Crop Type Linkings:", error);
      throw error;
    }
  }
}

module.exports = { SecondCropLinkingsService };
