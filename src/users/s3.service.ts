import { Injectable, Req, Res } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import {ConfigService} from '@nestjs/config'
@Injectable()
export class S3Service {
    constructor(private readonly configService: ConfigService){}
  AWS_S3_BUCKET = this.configService.get<string>('AWS_S3_BUCKET');
  s3 = new AWS.S3({
    accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
    secretAccessKey: this.configService.get<string>('AWS_S3_KEY_SECRET'),
  });

  async uploadFile(file:any,name:string) {
    console.log(typeof file)

    console.log("1")

    return await this.s3_upload(
      file[0].buffer,                       
      this.AWS_S3_BUCKET!,
      name,
      file[0].mimetype,
    );
  }

  async s3_upload(buffer:Buffer, bucket:string, name:string, mimetype:any) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: buffer,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-northeast-3',
      },
    };



    try {
      console.log("2")
      let s3Response = await this.s3.upload(params).promise();

console.log("3")
      return s3Response
    } catch (e) {
      console.log(e);
      console.log("4")
    }
  }
  async delete(Key:string){
      const params={Bucket:this.AWS_S3_BUCKET!,Key:Key}
      const response=await this.s3.deleteObject(params,((error,data)=>{
          if(error){
              console.log(error)
return error;
          }
          console.log(data)
return true
      }))
      console.log(response)
return response
  }
}
