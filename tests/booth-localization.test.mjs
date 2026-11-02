import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRegistration} from '../lib/registration-validation.mjs';
import {translateBoothErrors,translateBoothServerMessage} from '../app/registration/booth-translations.mjs';

test('booth validation messages are localized without changing validation rules',()=>{
  const input={type:'booth',firstName:'A',lastName:'Test',mobile:'123',city:'Tehran',referral:'bad',companyName:'Test',activity:'Test',website:'bad',requestedArea:'0'};
  const {errors}=validateRegistration(input);
  for(const locale of ['en','ar']){
    const translated=translateBoothErrors(errors,locale);
    assert.deepEqual(Object.keys(translated),Object.keys(errors));
    for(const message of Object.values(translated)){if(locale==='en')assert.doesNotMatch(message,/[\u0600-\u06ff]/u);else assert.match(message,/[\u0600-\u06ff]/u);}
    assert.match(translated.firstName,/2/);
    assert.match(translated.mobile,/09123456789/);
  }
  assert.deepEqual(translateBoothErrors(errors,'fa'),errors);
});

test('booth server errors preserve distinct recovery guidance',()=>{
  const duplicate='برای این شماره موبایل قبلاً در همین بخش درخواست ثبت شده است. برای پیگیری با دبیرخانه تماس بگیرید.';
  assert.match(translateBoothServerMessage(duplicate,'en'),/already been submitted/);
  assert.match(translateBoothServerMessage(duplicate,'ar'),/سبق تقديم طلب/);
  assert.equal(translateBoothServerMessage(duplicate,'fa'),duplicate);
});
