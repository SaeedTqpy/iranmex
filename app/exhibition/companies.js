// Names and logos from the client's PDF, page 14. Participation and profile
// details remain pending; add only information supplied or confirmed by each company.
export const companies = [
  {slug:'haft-kooh', name:'هفت کوه', logo:'/companies/company-000.png'},
  {slug:'gaya', name:'GAYA', logo:'/companies/company-002.png'},
  {slug:'chakad', name:'CHAKAD', logo:'/companies/company-004.png'},
  {slug:'pay-kooh', name:'پایه‌کوه', logo:'/companies/company-006.png'},
  {slug:'motal', name:'MOTAL', logo:'/companies/company-008.png'},
  {slug:'atis-club', name:'ATIS CLUB', logo:'/companies/company-010.png'},
  {slug:'apeiron', name:'Apeiron', logo:'/companies/company-011.png'},
  {slug:'elit-canyon', name:'ELIT CANYON', logo:'/companies/company-013.png'},
  {slug:'company-015', name:'مجموعه در انتظار معرفی', logo:'/companies/company-015.png'},
  {slug:'oresland', name:'ORESLAND', logo:'/companies/company-017.png'},
].map(company => ({description:null, products:[], website:null, phone:null, email:null, ...company}));

export const exhibitionDocuments = [
  {id:'map', title:'نقشه نمایشگاه', description:'جانمایی غرفه‌ها و مسیرهای بازدید', href:null},
  {id:'catalogue', title:'کاتالوگ نمایشگاه', description:'معرفی شرکت‌ها و محصولات نمایشگاه', href:null},
];
