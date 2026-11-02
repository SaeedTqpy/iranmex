import {readAdminSession} from '../../../../lib/server/admin-request';
import {openAdminStore} from '../../../../lib/server/admin-store.mjs';
import {experienceOptions,referralOptions} from '../../../../lib/registration-validation.mjs';
import {boothStatuses} from '../../../../lib/server/registrations-admin.mjs';
export const runtime='nodejs';
export async function GET(){const session=await readAdminSession();if(!session)return Response.json({message:'لطفاً وارد پنل شوید.'},{status:401,headers:{'Cache-Control':'no-store'}});
  const store=openAdminStore();try{const count=store.db.prepare('SELECT count(*) AS n FROM registrations').get().n;if(count>50000)return Response.json({message:'تعداد اطلاعات برای این خروجی زیاد است؛ از خروجی سرور استفاده کنید.'},{status:413,headers:{'Cache-Control':'no-store'}});
    const rows=store.db.prepare('SELECT id,type,status,created_at,payload FROM registrations ORDER BY created_at DESC').all();
    const columns=[['reference','کد پیگیری'],['type','نوع'],['status','وضعیت'],['createdAt','تاریخ ثبت UTC'],['firstName','نام'],['lastName','نام خانوادگی'],['mobile','موبایل'],['jobTitle','سمت'],['experience','سابقه'],['city','شهر'],['email','ایمیل'],['referral','نحوه آشنایی'],['companyName','شرکت'],['activity','فعالیت'],['website','وب‌سایت'],['requestedArea','متراژ پیشنهادی'],['notes','توضیحات']];
    const cell=(value,forceText=false)=>{let text=String(value??'');if(forceText||/^[\s\u007f\u00a0]*[=+@\-]/.test(text))text="'"+text;return `"${text.replaceAll('"','""')}"`;};
    const lines=[columns.map(([,label])=>cell(label)).join(',')];for(const row of rows){const fields=JSON.parse(row.payload);const values={...fields,reference:row.id,type:row.type==='booth'?'درخواست غرفه':'بازدید',status:row.type==='booth'?(boothStatuses[row.status]||row.status):'ثبت‌شده',experience:experienceOptions.find(([id])=>id===fields.experience)?.[1]||fields.experience,referral:referralOptions.find(([id])=>id===fields.referral)?.[1]||fields.referral,createdAt:new Date(row.created_at).toISOString()};lines.push(columns.map(([key])=>cell(values[key],key==='mobile')).join(','));}
    store.audit(session.username,'registrations_exported','all');
    return new Response('\uFEFF'+lines.join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="iranmex-registrations.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{console.error('Admin export unavailable.');return Response.json({message:'خروجی آماده نشد.'},{status:503,headers:{'Cache-Control':'no-store'}});}finally{store.close();}}
