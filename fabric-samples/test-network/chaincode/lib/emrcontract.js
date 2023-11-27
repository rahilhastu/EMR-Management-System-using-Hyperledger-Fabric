"use strict";

const { Contract } = require("fabric-contract-api");

class User {
  constructor(name, email, userType, ownedEMRList, addedUserList) {
    this.name = name; 
    this.email = email; 
    this.userType = userType; 
    this.ownedEMRList = ownedEMRList; 
    this.addedUserList = addedUserList; 
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  getType() {
    return this.userType;
  }

  getOwns() {
    return this.ownedEMRList;
  }

  getaddedUserList() {
    return this.addedUserList;
  }
  
  setName(name) {
    this.name = name;
  }

  setEmail(email) {
    this.email = email;
  }

  setType(userType) {
    this.userType = userType;
  }

  setOwns(ownedEMRList) {
    this.ownedEMRList = ownedEMRList;
  }

  setaddedUserList(addedUserList) {
    this.addedUserList = addedUserList;
  }

  checkPermissionForUser(email) {
    let pos = this.addedUserList.indexOf(email);
    if (pos === -1) return false;
    return true;
  }

  

  static deserialize(data) {
    return new User(
      data.name,
      data.email,
      data.userType,
      data.ownedEMRList,
      data.addedUserList
    );
  }
}

class EMR {
  constructor(
    ID,
    recordOwner,
    recordAdder,
    recordType,
    recordContent,
    recordCreationDate,
    permittedList
  ) {
    this.ID = ID; 
    this.recordOwner = recordOwner; 
    this.recordAdder = recordAdder; 
    this.recordType = recordType; 
    this.recordContent = recordContent; 
    this.recordCreationDate = recordCreationDate; 
    this.permittedList = permittedList; 
  }

  
  getID() {
    return this.ID;
  }

  getRecordOwner() {
    return this.recordOwner;
  }

  getRecordAdder() {
    return this.recordAdder;
  }

  getRecordType() {
    return this.recordType;
  }

  getrecordCreationDate() {
    return this.recordCreationDate;
  }

  getContent() {
    return this.recordContent;
  }

  getPermittedList() {
    return this.permittedList;
  }

  checkUserInPermittedList(ID) {
    let pos = this.permittedList.indexOf(ID);
    if (pos === -1) return false;
    return true;
  }
  
  setID(ID) {
    this.ID = ID;
  }

  setRecordOwner(recordOwner) {
    this.recordOwner = recordOwner;
  }

  setRecordAdder(recordAdder) {
    this.recordAdder = recordAdder;
  }

  setRecordType(recordType) {
    this.recordType = recordType;
  }

  setRecordCreationDate(recordCreationDate) {
    this.recordCreationDate = recordCreationDate;
  }

  setContent(recordContent) {
    this.recordContent = recordContent;
  }

  setPermittedList(permittedList) {
    this.permittedList = permittedList;
  }

  static deserialize(data) {
    return new EMR(
      data.ID,
      data.recordOwner,
      data.recordAdder,
      data.recordType,
      data.recordContent,
      data.recordCreationDate,
      data.permittedList
    );
  }
}



class EMRContract extends Contract {
  async initLedger(ctx) {
    const users = [
      {
        name: "Snehal Chaudhari",
        email: "snehalchaudhari@gmail.com",
        userType: "patient",
      },
      {
        name: "David Scott",
        email: "david@gmail.com",
        userType: "doctor",
      },
      {
        name: "Rahil Hastu",
        email: "rahilHastu@gmail.com",
        userType: "patient",
      },
      {
        name: "Shreya Gore",
        email: "shreyagore@gmail.com",
        userType: "patient",
      },
      {
        name: "Aebs Jacob",
        email: "aebsj@gmail.com",
        userType: "doctor",
      },
    ];
    for (let i = 0; i < users.length; i++) {
      await this.addEntityUser(
        ctx,
        users[i].name,
        users[i].email,
        users[i].userType
      );
    }

    return users;
  }

  async initEMR(ctx) {
    const emrs = [
      {
        ID: "01",
        recordOwner: "rahilHastu@gmail.com",
        recordAdder: "david@gmail.com",
        recordType: "medical",
        recordContent: `Dummy record 1`,
      },

      {
        ID: "02",
        recordOwner: "rahilHastu@gmail.com",
        recordAdder: "aebsj@gmail.com",
        recordType: "test",
        recordContent: `   dummy record 2  `,
      },
    ];

    for (let i = 0; i < emrs.length; i++) {
      await this.addEMR(
        ctx,
        emrs[i].recordOwner,
        emrs[i].recordAdder,
        emrs[i].ID,
        emrs[i].recordType,
        emrs[i].recordContent
      );
    }
    return emrs;
  }

  async addEntityUser(ctx, name, email, type) {
    
    let userKey = ctx.stub.createCompositeKey("User", [email]);
    const keyBytes = await ctx.stub.getState(userKey);
    if (keyBytes.length > 0) {
           throw new Error(`User with ID: ${email} already exist`);
    }
  
    var ownedEMRList = new Array();
    var addedUserList = new Array();
    
    const user = new User(name, email, type, ownedEMRList, addedUserList);
   
    await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
    return `User added with ID ${email} to hospital peers`;
  }

  async addEMR(ctx, userID, adder, ID, type, content) {    
    let userKey = ctx.stub.createCompositeKey("User", [userID]);
    const keyBytes = await ctx.stub.getState(userKey);
    
    if (keyBytes.length === 0) {
      throw new Error(` ${userID} : User ID not found`);
    }

    let adderKey = ctx.stub.createCompositeKey("User", [adder]);
    const adderAsBytes = await ctx.stub.getState(adderKey);

    if (adderAsBytes.length === 0) {
      throw new Error(`${adder} : User ID not found `);
    }
    
    const user = User.deserialize(JSON.parse(keyBytes.toString()));
    
    if (user.checkPermissionForUser(adder) === false) {
      throw new Error(
        ` User ${adder} don't have valid access to add for user: ${userID}`
      );
    }
    
    else {
      const emrKey = ctx.stub.createCompositeKey("EMR", [ID]);
      const emrAsBytes = await ctx.stub.getState(emrKey);
      
      if (emrAsBytes.length > 0) {
        throw new Error(` ${ID} : EMR ID already exist`);
      } else {
        
        user.ownedEMRList.push(ID);
        var getDateString = function () {
          var sp = "/";
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth() + 1; 
          var yyyy = today.getFullYear();
          if (dd < 10) dd = "0" + dd;
          if (mm < 10) mm = "0" + mm;
          return dd + sp + mm + sp + yyyy;
        };
        
        const permittedList = new Array();
        permittedList.push(userID);
        

        const emr = new EMR(
          ID,
          userID,
          adder,
          type,
          content,
          getDateString(),
          permittedList
        );
        
        await ctx.stub.putState(emrKey, Buffer.from(JSON.stringify(emr)));
        
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return `
        Successfully added EMF with ID: ${ID} to user with ID: ${userID}
        recordOwner: ${userID}
        adder: ${adder}
        type: ${type}
        creation date: ${emr.getrecordCreationDate()} 
        `;
      }
    }
  }

  async getEMR(ctx, emrID, email) {
    
    const emrKey = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(emrKey);
    
    if (emrAsBytes.length === 0) {
      throw new Error(` ${ID} : EMR ID does not exist`);
    }

    let key2 = ctx.stub.createCompositeKey("User", [email]);
    const keyBytes = await ctx.stub.getState(key2);
    
    if (keyBytes.length === 0) {
      throw new Error(`${adder} : User ID not found `);
    }
    
    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    if (emr.checkUserInPermittedList(email) === true) {
      return emr.getContent();
    } else {
      throw new Error(
        ` ${email} User don't have view  permission to EMR record: ${emrID}`
      );
    }
  }

  
  async getAllUserEMRRecord(ctx, userEmail) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(userKey);
    
    if (keyBytes.length === 0) {
      throw new Error(`${userKey} : User ID not found `);
    }

    
    const user = User.deserialize(JSON.parse(keyBytes.toString()));
    const emrIDs = user.getOwns();
    
    if (emrIDs.length > 0) {
      const emrs = [];
      for (let i = 0; i < emrIDs.length; i++) {
        const emrKey = ctx.stub.createCompositeKey("EMR", [emrIDs[i]]);
        const emrAsBytes = await ctx.stub.getState(emrKey);
        const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
        
        
        emrs.push([
          emr.getRecordAdder(),
          emr.getRecordType(),
          emr.getContent(),
          emr.getrecordCreationDate(),
          emr.getPermittedList().length,
        ]);
      }

      
      return emrs;
    } else {
      throw new Error(`User: ${userKey} don't have any EMR`);
    }
  }

  
  async viewAllUsersWithAddAccess(ctx, userEmail) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(userKey);
    
    if (keyBytes.length === 0) {
      throw new Error(`${userKey}: User ID not found`);
    }

    const user = User.deserialize(JSON.parse(keyBytes.toString()));
    const adderUserList = user.getaddedUserList();

    if (adderUserList.length > 0) {
      const resPermittedUserList = [];
      for (let i = 0; i < adderUserList.length; i++) {
        const userKey = ctx.stub.createCompositeKey("User", [adderUserList[i]]);
        const userKeyrAsBytes = await ctx.stub.getState(userKey);
        const perUser = User.deserialize(
          JSON.parse(userKeyrAsBytes.toString())
        );
        resPermittedUserList.push([
          perUser.getName(),
          perUser.getEmail(),
          perUser.getType(),
        ]);
      }
      return resPermittedUserList;
    } else {
      throw new Error(`${userKey} User didn't add access to any doctor to insert record`);
    }
  }
  
  async getGrantedUserForEMR(ctx, emrID, userEmail) {
    const emrKey = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(emrKey);
    
    if (emrAsBytes.length === 0) {
      throw new Error(`${ID} : EMR ID does not exist`);
    }

    let key2 = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(key2);
    
    if (keyBytes.length === 0) {      
      throw new Error(`${userKey}: User ID not found`);
    }

    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    const permittedList = emr.getPermittedList();

    if (emr.getRecordOwner() === userEmail) {
      if (permittedList.length > 0) {
        const resPermittedUserList = [];
        for (let i = 0; i < permittedList.length; i++) {
          const userKey = ctx.stub.createCompositeKey("User", [
            permittedList[i],
          ]);
          const userKeyrAsBytes = await ctx.stub.getState(userKey);
          const perUser = User.deserialize(
            JSON.parse(userKeyrAsBytes.toString())
          );
          resPermittedUserList.push([
            perUser.getName(),
            perUser.getEmail(),
            perUser.getType(),
          ]);
        }
        return resPermittedUserList;
      } else {
        throw new Error(
          ` EMR ${emrID} doesn't have any  view access permission any users.`
        );
      }
    } else {
      throw new Error(
        `${userEmail} User doesn't own EMR record: ${emrID}`
      );
    }
  }

  async grantUserViewPermission(ctx, userEmail, viewerEmail, emrID) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(userKey);
    
    if (keyBytes.length === 0) {
      throw new Error(`${userEmail} : User ID not found`);
    }

    const key2 = ctx.stub.createCompositeKey("User", [viewerEmail]);
    const userAsBytes2 = await ctx.stub.getState(key2);
    
    if (userAsBytes2.length === 0) {
      throw new Error(`${viewerEmail} : User ID not found`);
    }
    
    const emrKey = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(emrKey);

    if (emrAsBytes.length === 0) {
      throw new Error(` ${emrID} : EMR ID does not exist`);
    }
    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    
    if (emr.getRecordOwner() === userEmail) {
      if (emr.checkUserInPermittedList(viewerEmail) === false) {
        emr.permittedList.push(viewerEmail);
        await ctx.stub.putState(emrKey, Buffer.from(JSON.stringify(emr)));
        return `View access to the EMR with ID ${emrID} has been successfully granted to the user with ID ${viewerEmail}.`;
      } else {
        return `${viewerEmail} is already the user with view access.`;
      }
    } else {
      throw new Error(
        `The EMR with ID: ${emrID} is not owned by the user with ID: ${userEmail}.`
      );
    }
  }

  async revokeUserViewPermission(ctx, userEmail, viewerEmail, emrID) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(userKey);
    
    if (keyBytes.length === 0) {
      throw new Error(` ${userEmail} : User ID not found`);
    }

    const key2 = ctx.stub.createCompositeKey("User", [viewerEmail]);
    const userAsBytes2 = await ctx.stub.getState(key2);
    
    if (userAsBytes2.length === 0) {
      throw new Error(`${viewerEmail} : User ID not found`);
    }
    
    const emrKey = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(emrKey);

    if (emrAsBytes.length === 0) {
      throw new Error(`EMR having ID: ${emrID} is not present.}`);
    }
    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    
    if (emr.getRecordOwner() === userEmail) {
      if (emr.checkUserInPermittedList(viewerEmail) === true) {
        let pos = emr.permittedList.indexOf(viewerEmail);
        emr.permittedList.splice(pos, 1);
        await ctx.stub.putState(emrKey, Buffer.from(JSON.stringify(emr)));
        return `The user with ID: ${viewerEmail} has successfully had their view access to the EMR with ID: ${emrID} removed.`;
      } else {
        return `The user ${viewerEmail} does not currently have view access.`;
      }
    } else {
      throw new Error(
        `The EMR with ID: ${emrID} is not owned by the user with ID: ${userEmail}.`
      );
    }
  }

  async grantUserAddPermission(ctx, userEmail, adderEmail) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(userKey);
    const adderKey = ctx.stub.createCompositeKey("User", [adderEmail]);
    const adderAsBytes = await ctx.stub.getState(adderKey);
    
    if (keyBytes.length === 0) {
      throw new Error(` ${userEmail} : User ID not found`);
    } else if (adderAsBytes.length === 0) {
      throw new Error(` ${adderEmail}: User ID not found`);
    } else {
      let user = User.deserialize(JSON.parse(keyBytes.toString()));
      
      if (user.checkPermissionForUser(adderEmail) === false) {
        user.addedUserList.push(adderEmail);
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        
        return `Permission to add EMR for user with ID: ${userEmail} has been successfully granted to user with ID: ${adderEmail}.`;
      } else {
        return `User already in adder list with ID: ${adderEmail}`;
      }
    }
  }

  async revokeUserAddPermission(ctx, userEmail, adderEmail) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const keyBytes = await ctx.stub.getState(userKey);
    
    const adderKey = ctx.stub.createCompositeKey("User", [adderEmail]);
    const adderAsBytes = await ctx.stub.getState(adderKey);
    
    if (keyBytes.length === 0) {
      throw new Error(` ${userEmail} : User ID not found`);
    } else if (adderAsBytes.length === 0) {
      throw new Error(`${adderEmail}  : User ID not found`);
    } else {
      const user = User.deserialize(JSON.parse(keyBytes.toString()));
      
      if (user.checkPermissionForUser(adderEmail) === true) {
        let pos = user.addedUserList.indexOf(adderEmail);
        user.addedUserList.splice(pos, 1);
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return `Permission to add an EMR for user with ID: ${userEmail} has been successfully removed.`;
      }
      return `The user ${adderEmail} has not yet been added to the adder list!`;
    }
  }
}

module.exports = EMRContract;
