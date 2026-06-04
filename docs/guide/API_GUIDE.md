export const account = {
'api/v1/account/me': {
id: 'int',
email: 'str',
nickname: 'str',
name: 'str',
phone_number: 'str',
birthday: 'str',
gender: 'enum(M, F)',
profile_img_url: 'str',
cohort_id: 'int | null',
created_at: 'datetime',
},
'api/v1/accounts/me/enrolled-courses': {
cohort: {
id: 'int',
number: 'int',
start_date: 'datetime',
end_date: 'datetime',
status: 'enum(PENDING,IN_PROGRESS,COMPLETED)',
},
course: {
id: 'int',
name: 'str',
tag: 'str',
thumbnail_img_url: 'str',
},
},
'PUT api/v1/accounts/me/profile-image/presigned-url': {  
request: {  
file_name: {  
type: 'str',  
required: 'true'  
}  
}  
response: {
presigned_url: 'str',  
img_url: 'str',  
key: 'str'  
}
}  
'api/v1/accounts/me/profile-image': {
request: {
profile_img_url: 'str'
}
response: {
detail: 'str'
}
}
'PATCH api/v1/accounts/change-phone': {
request: {
phone_verify_token: {
type: 'str',
required: 'true',
}
}
response: {
detail: 'str',
phone_number: 'str'
}
}
'PATCH api/v1/accounts/me': {
request : {
nickname: {
type: 'str',
required: 'false',
},
name: {
type: 'str',
required: 'false',
},
birthday: {
type: 'date',
format: 'YYYY-MM-DD,
required: 'false',
},
gender: {
type: 'enum("M", "F")',
required: 'false',
}
}
response:  
{
id: 'int',
email: 'str',
nickname: 'str',
name: 'str',
birthday: 'str',
gender: 'enum("M","F")'
phone_number: 'str',
updated_at: 'datetime'
}
}
'POST api/v1/accounts/verification/send-sms': {
request: {phone_number: {
type: 'str',
format:' r"^\+\d{11,15}$"',
required: 'true',
},
purpose: {
type: 'str',
choices: '["signup", "find_email", "phone_change"]',
required: 'true',
}
}
}
'POST api/v1/accounts/verification/verify-sms': {
request: {
phone_number: {
type: 'str',
format: 'r"\+\d{11}"',
required: 'true',
},
code: {
type: 'str',
format: 'r"^\d{6}$"',
required: 'true',
}
}
response:200: {
detail: 'str'
sms_token: 'str'
}
}
}
'POST api/v1/accounts/change-password': {
request: {
old_password: {
type: 'str',
required: 'true',
},
new_password: {
type: 'str',
required: 'true',
},
}
response: {
200: {
detail: 'str'
}
}
}
