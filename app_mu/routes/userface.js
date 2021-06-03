var async=require("asyncawait/async")
var await=require("asyncawait/await")
var user=require("../model/userModel");
var face=require("../model/faceModel");

function userface() {

	this.saveUser=async ((work_num, name)=>{
		let obj=await (user.createAsync({
			work_num:work_num,
            name:name
        }));
        return obj;
    })
	this.findUser=async ((work_num, name, userId)=>{
		let obj;
        if(userId)
        {
            obj= await (user.findOneAsync({
                _id:userId
            },"-work_num -name"));
        }
        else if(work_num)
        {
            obj= await (user.findOneAsync({
                work_num:work_num
            },"-work_num -name"));
        }
        else
        {
            obj= await (user.findOneAsync({
                name:name
            },"-work_num -name"));
        }
        return obj;
    })
	this.updateUser=async ((work_num, name)=>{
		let obj = await (user.findOneAndUpdateAsync({
            work_num:work_num
        },{
			work_num:work_num,
			name:name
        }));
		
        return obj;
    })
	this.saveFace=async ((face_token, img_file, age, gender, beauty, work_num)=>{
		let obj=await (face.createAsync({
			face_token:face_token,
            img_file:img_file,
            age:age,
            gender:gender,
            beauty:beauty,
            work_num:work_num
        }));
        return obj;
    })
	this.updateFace=async ((face_token, work_num)=>{
		let obj = await (user.findOneAndUpdateAsync({
            face_token:face_token
        },{
			work_num:work_num
        }));
		
        return obj;
    })
	this.findFace=async ((face_token)=>{
		let obj = obj= await (user.findOneAsync({
                face_token:face_token
         },"-work_num -gender --age --beauty --img_file"));
        return obj;
    })
}
module.exports = userface;
