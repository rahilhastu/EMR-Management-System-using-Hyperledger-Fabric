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
    
    let key = ctx.stub.createCompositeKey("User", [email]);
    const userAsBytes = await ctx.stub.getState(key);
    if (userAsBytes.length > 0) {
      //refactor error message
        
           throw new Error(`User with ID: ${email} already exist`);
    }
  
    var ownedEMRList = new Array();
    var addedUserList = new Array();

    
    const user = new User(name, email, type, ownedEMRList, addedUserList);
   
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
    return `User with ID: ${email} successfully added to system`;
  }

  async addEMR(ctx, userID, adder, ID, type, content) {    
    let key = ctx.stub.createCompositeKey("User", [userID]);
    const userAsBytes = await ctx.stub.getState(key);
    
    if (userAsBytes.length === 0) {
      throw new Error(`User with ID: ${userID} doesn't exist`);
    }

    let adderKey = ctx.stub.createCompositeKey("User", [adder]);
    const adderAsBytes = await ctx.stub.getState(adderKey);

    if (adderAsBytes.length === 0) {
      throw new Error(`User with ID: ${adder} doesn't exist`);
    }
    
    const user = User.deserialize(JSON.parse(userAsBytes.toString()));
    
    if (user.checkPermissionForUser(adder) === false) {
      throw new Error(
        `User with ID: ${adder} does not have permission to add for user: ${userID}`
      );
    }
    
    else {
      const emrKey = ctx.stub.createCompositeKey("EMR", [ID]);
      const emrAsBytes = await ctx.stub.getState(emrKey);
      
      if (emrAsBytes.length > 0) {
        throw new Error(`EMR with ID: ${ID}  already exist`);
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
        
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        return `
        EMR with ID: ${ID} successfully added with following info
        recordOwner: ${userID}
        adder: ${adder}
        type: ${type}
        creation date: ${emr.getrecordCreationDate()} 
        `;
      }
    }
  }

  async getEMR(ctx, emrID, email) {
    
    const key = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(key);
    
    if (emrAsBytes.length === 0) {
      throw new Error(`EMR with ID: ${emrID} does not exist`);
    }

    let key2 = ctx.stub.createCompositeKey("User", [email]);
    const userAsBytes = await ctx.stub.getState(key2);
    
    if (userAsBytes.length === 0) {
      console.info("Here is an error");
      
      throw new Error(`User with ID: ${email} doesn't exist`);
    }
    
    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    if (emr.checkUserInPermittedList(email) === true) {
      return emr.getContent();
    } else {
      throw new Error(
        `User with ID ${email} doesn't have access permission to EMR with ID: ${emrID}`
      );
    }
  }

  
  async viewAllEMR(ctx, userEmail) {
    
    const key = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(key);
    
    if (userAsBytes.length === 0) {
      throw new Error(`${key} does not exist`);
    }

    
    const user = User.deserialize(JSON.parse(userAsBytes.toString()));
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
      throw new Error(`${key} does not own any EMR`);
    }
  }

  
  async viewAllUsersWithAddAccess(ctx, userEmail) {
    
    const key = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(key);
    
    if (userAsBytes.length === 0) {
      throw new Error(`${key} does not exist`);
    }

    const user = User.deserialize(JSON.parse(userAsBytes.toString()));
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
      throw new Error(`${key} didn't grant access to any doctor`);
    }
  }
  
  async getGrantedUserForEMR(ctx, emrID, userEmail) {
    const key = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(key);
    
    if (emrAsBytes.length === 0) {
      throw new Error(`EMR with ID: ${emrID} does not exist`);
    }

    let key2 = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(key2);
    
    if (userAsBytes.length === 0) {
      console.info("Here is an error");
      
      throw new Error(`User with ID: ${email} doesn't exist`);
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
          ` EMR ${emrID} doesn't have access permission any users.`
        );
      }
    } else {
      throw new Error(
        `User with ID: ${userEmail} doesn't own EMR with ID: ${emrID}`
      );
    }
  }

  async grantViewAccess(ctx, userEmail, viewerEmail, emrID) {
    
    const key = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(key);
    
    if (userAsBytes.length === 0) {
      throw new Error(`User with ID: ${userEmail} does not exist`);
    }

    const key2 = ctx.stub.createCompositeKey("User", [viewerEmail]);
    const userAsBytes2 = await ctx.stub.getState(key2);
    
    if (userAsBytes2.length === 0) {
      throw new Error(`User with ID: ${viewerEmail} does not exist`);
    }
    
    const emrKey = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(emrKey);

    if (emrAsBytes.length === 0) {
      throw new Error(`EMR with ID: ${emrID} does not exist`);
    }
    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    
    if (emr.getRecordOwner() === userEmail) {
      if (emr.checkUserInPermittedList(viewerEmail) === false) {
        emr.permittedList.push(viewerEmail);
        await ctx.stub.putState(emrKey, Buffer.from(JSON.stringify(emr)));
        return `User with ID: ${viewerEmail} has been successfully given view access of EMR with ID: ${emrID}`;
      } else {
        return `User with ID: ${viewerEmail} already has view access`;
      }
    } else {
      throw new Error(
        `User with ID: ${userEmail} doesn't own EMR with ID: ${emrID}`
      );
    }
  }

  async revokeViewAccess(ctx, userEmail, viewerEmail, emrID) {
    
    const key = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(key);
    
    if (userAsBytes.length === 0) {
      throw new Error(`User with ID: ${userEmail} does not exist`);
    }

    const key2 = ctx.stub.createCompositeKey("User", [viewerEmail]);
    const userAsBytes2 = await ctx.stub.getState(key2);
    
    if (userAsBytes2.length === 0) {
      throw new Error(`User with ID: ${viewerEmail} does not exist`);
    }
    
    const emrKey = ctx.stub.createCompositeKey("EMR", [emrID]);
    const emrAsBytes = await ctx.stub.getState(emrKey);

    if (emrAsBytes.length === 0) {
      throw new Error(`EMR with ID: ${emrID} does not exist`);
    }
    const emr = EMR.deserialize(JSON.parse(emrAsBytes.toString()));
    
    if (emr.getRecordOwner() === userEmail) {
      if (emr.checkUserInPermittedList(viewerEmail) === true) {
        let pos = emr.permittedList.indexOf(viewerEmail);
        emr.permittedList.splice(pos, 1);
        await ctx.stub.putState(emrKey, Buffer.from(JSON.stringify(emr)));
        return ` View access of EMR with ID: ${emrID} has been successfully removed from user with ID: ${viewerEmail}`;
      } else {
        return `User with ID: ${viewerEmail} doesn't have view access yet`;
      }
    } else {
      throw new Error(
        `User with ID: ${userEmail} doesn't own EMR with ID: ${emrID}`
      );
    }
  }

  async grantAddAccess(ctx, userEmail, adderEmail) {
    
    const key = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(key);
    const adderKey = ctx.stub.createCompositeKey("User", [adderEmail]);
    const adderAsBytes = await ctx.stub.getState(adderKey);
    
    if (userAsBytes.length === 0) {
      throw new Error(`$User with ID: ${userEmail} does not exist`);
    } else if (adderAsBytes.length === 0) {
      throw new Error(`User with ID: ${adderEmail} does not exist`);
    } else {
      let user = User.deserialize(JSON.parse(userAsBytes.toString()));
      
      if (user.checkPermissionForUser(adderEmail) === false) {
        user.addedUserList.push(adderEmail);
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(user)));
        
        return `User with ID: ${adderEmail} successfully given permission to add EMR for user with ID: ${userEmail}`;
      } else {
        return `User with ID: ${adderEmail} already in adder list`;
      }
    }
  }

  async revokeAddAccess(ctx, userEmail, adderEmail) {
    
    const userKey = ctx.stub.createCompositeKey("User", [userEmail]);
    const userAsBytes = await ctx.stub.getState(userKey);
    
    const adderKey = ctx.stub.createCompositeKey("User", [adderEmail]);
    const adderAsBytes = await ctx.stub.getState(adderKey);
    
    if (userAsBytes.length === 0) {
      throw new Error(`$User with ID: ${userEmail} does not exist`);
    } else if (adderAsBytes.length === 0) {
      throw new Error(`User with ID: ${adderEmail} does not exist`);
    } else {
      const user = User.deserialize(JSON.parse(userAsBytes.toString()));
      
      if (user.checkPermissionForUser(adderEmail) === true) {
        let pos = user.addedUserList.indexOf(adderEmail);
        user.addedUserList.splice(pos, 1);
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return `Permission successfully removed from user with ID: ${adderEmail} to add EMR for user with ID: ${userEmail}`;
      }
      return `$User with ${adderEmail} is yet to be in adder list!`;
    }
  }
}

module.exports = EMRContract;
