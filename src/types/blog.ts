export interface BlogPost {
  Id: string
  Title__c: string
  Slug__c: string
  Summary__c: string
  Body__c: string
  Cover_Image_URL__c: string | null
  Tags__c: string | null
  Published_Date__c: string
  Is_Published__c: boolean
  Read_Time__c: number | null
}
