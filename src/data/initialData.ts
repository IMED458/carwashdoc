/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Category, 
  Supplier, 
  Tranche, 
  Expense, 
  ExpenseStatus, 
  Payment, 
  Document, 
  PayrollOrIndividualService, 
  TaxSettings, 
  Comment, 
  StatusHistory, 
  AuditLog, 
  Notification,
  User
} from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u-1', name: 'გიორგი იმედაშვილი', email: 'imedashviligio27@gmail.com', role: 'admin', isActive: true },
  { id: 'u-2', name: 'ნინო ხარატიშვილი', email: 'n.kharatishvili@acc.ge', role: 'accountant', isActive: true },
  { id: 'u-3', name: 'დავით კობახიძე', email: 'd.kobakhidze@wash.ge', role: 'manager', isActive: true },
  { id: 'u-4', name: 'ეკატერინე მელაძე', email: 'e.meladze@wash.ge', role: 'viewer', isActive: true },
  { id: 'u-5', name: 'სანდრო რეხვიაშვილი', email: 's.rekhviashvili@wash.ge', role: 'uploader', isActive: true }
];

export const INITIAL_BUDGET_SETTINGS = {
  initialBudget: 50000,
  projectName: 'ავტომანქანის თვითმომსახურების სამრეცხაო',
  currency: 'GEL'
};

export const INITIAL_TAX_SETTINGS: TaxSettings = {
  incomeTaxPercent: 20,
  pensionEmployeePercent: 2,
  pensionEmployerPercent: 2
};

export const INITIAL_TRANCHES: Tranche[] = [
  {
    id: 'tr-1',
    trancheNumber: 1,
    receivedDate: '2026-05-10',
    amount: 30000,
    documentName: 'tranche_1_statement_tbc.pdf',
    comment: 'პირველი ტრანში - პროექტის დამტკიცების შემდგომი საწყისი დაფინანსება',
    createdAt: '2026-05-10T11:00:00Z'
  },
  {
    id: 'tr-2',
    trancheNumber: 2,
    receivedDate: '2026-06-15',
    amount: 20000,
    documentName: 'tranche_2_statement_tbc.pdf',
    comment: 'მეორე ტრანში - სამშენებლო ეტაპის შუალედური ანგარიშის ჩაბარების შემდეგ',
    createdAt: '2026-06-15T10:30:00Z'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'მიწის/ტერიტორიის მომზადება',
    description: 'მიწის ნაკვეთის მოსწორება, გათხრა, გრუნტის მომზადება',
    plannedBudget: 5000,
    isAllowedGrant: true,
    comment: 'მოიცავს ექსკავატორის მომსახურებას და გრუნტის მოსწორებას',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-2',
    name: 'სამშენებლო სამუშაოები',
    description: 'სამშენებლო მასალები და მშენებლების შრომითი ხარჯები',
    plannedBudget: 8000,
    isAllowedGrant: true,
    comment: 'საჭიროა დეტალური ხელშეკრულებები და მიღება-ჩაბარებები',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-3',
    name: 'ბეტონი, იატაკი, სადრენაჟო სამუშაოები',
    description: 'ბეტონის დასხმა, არმირება და სამრეცხაო პოსტების იატაკის მოწყობა',
    plannedBudget: 12000,
    isAllowedGrant: true,
    comment: 'მნიშვნელოვანია ზედნადების და საგადასახადო ანგარიშ-ფაქტურის არსებობა RS.GE-ზე',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-4',
    name: 'წყლის სისტემა',
    description: 'წყალმომარაგების მილების გაყვანა, დაერთება',
    plannedBudget: 3000,
    isAllowedGrant: true,
    comment: 'გრანტით ანაზღაურებადი ძირითადი აქტივი',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-5',
    name: 'ელექტროობა',
    description: 'ელექტროგაყვანილობა, განათება, ფარები და ავტომატები',
    plannedBudget: 2500,
    isAllowedGrant: true,
    comment: 'უნდა განხორციელდეს ლიცენზირებული ელექტრიკოსის მიერ',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-6',
    name: 'კანალიზაცია',
    description: 'სადრენაჟო ტრაპები, ჭები, ქვიშადამჭერები და კანალიზაციის ქსელი',
    plannedBudget: 3000,
    isAllowedGrant: true,
    comment: 'ეკოლოგიური სტანდარტების შესაბამისი ფილტრაციის ჭებით',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-7',
    name: 'მეტალოკონსტრუქცია',
    description: 'სამრეცხაო ბოქსების რკინის ჩონჩხის დამზადება',
    plannedBudget: 6000,
    isAllowedGrant: true,
    comment: 'შეიძლება შესრულდეს ფიზიკური პირის მიერ (საშემოსავლოს დაკავებით)',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-8',
    name: 'გადახურვა',
    description: 'ბოქსების გადახურვა პოლიკარბონატით ან თუნუქით',
    plannedBudget: 2000,
    isAllowedGrant: true,
    comment: 'მეტალოკონსტრუქციის დასრულების შემდგომი ეტაპი',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-9',
    name: 'თვითმომსახურების სამრეცხაოს აპარატურა',
    description: 'ძირითადი მართვის პანელები და კონტროლერები',
    plannedBudget: 15000,
    isAllowedGrant: true,
    comment: 'პროექტის ყველაზე ძვირადღირებული და მნიშვნელოვანი ნაწილი',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-10',
    name: 'მაღალი წნევის აპარატები',
    description: 'იტალიური ან გერმანული მაღალი წნევის ტუმბოები და ძრავები',
    plannedBudget: 8000,
    isAllowedGrant: true,
    comment: 'აუცილებელია მწარმოებლის სერტიფიკატის თანდართვაც',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-11',
    name: 'მტვერსასრუტები',
    description: 'თვითმომსახურების მტვერსასრუტის აპარატი',
    plannedBudget: 3500,
    isAllowedGrant: true,
    comment: 'ორპოსტიანი უჟანგავი კორპუსით',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-12',
    name: 'მონეტების/ბარათის გადახდის სისტემა',
    description: 'ბილეთების მიმღები, მონეტების მიმღები და უკონტაქტო ბარათის წამკითხველები',
    plannedBudget: 4000,
    isAllowedGrant: true,
    comment: 'POS ტერმინალებთან ინტეგრირებული სისტემა',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-13',
    name: 'წყლის ფილტრაცია/დამარბილებელი სისტემა',
    description: 'უხეში ფილტრები, ნახშირის ფილტრები და წყლის დამარბილებელი (Osmosis)',
    plannedBudget: 5000,
    isAllowedGrant: true,
    comment: 'გარანტიას აძლევს აპარატურის ხანგრძლივ მუშაობას',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-14',
    name: 'ქიმია და სარეცხი საშუალებები',
    description: 'აქტიური ქაფი, ცვილი, შამპუნები საწყისი მარაგისთვის',
    plannedBudget: 1500,
    isAllowedGrant: false,
    comment: 'ყურადღება: საოპერაციო ხარჯები არ ფინანსდება გრანტის ძირითადი ბიუჯეტით!',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-15',
    name: 'აბრების/ბრენდინგის ხარჯები',
    description: 'სარეკლამო აბრები, განათება, ლოგოს მოწყობა ბოქსებზე',
    plannedBudget: 2500,
    isAllowedGrant: true,
    comment: 'საჭიროა დიზაინ-პროექტის შეთანხმება მერიასთან, ასეთის არსებობისას',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-16',
    name: 'ვიდეოკამერები და უსაფრთხოება',
    description: 'IP კამერები, NVR ჩამწერი, დაცვის სიგნალიზაცია',
    plannedBudget: 2000,
    isAllowedGrant: true,
    comment: 'სამრეცხაოს 24/7 ონლაინ მონიტორინგისთვის',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-17',
    name: 'POS/სალარო/გადახდის მოწყობილობები',
    description: 'ფისკალური აპარატი, დამხმარე კომპიუტერი და პრინტერი',
    plannedBudget: 1200,
    isAllowedGrant: true,
    comment: 'ბუღალტრულ პროგრამასთან თავსებადი',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-18',
    name: 'პროგრამული უზრუნველყოფა',
    description: 'სამრეცხაოს მართვისა და მონიტორინგის ლიცენზია',
    plannedBudget: 1000,
    isAllowedGrant: true,
    comment: 'წლიური სალიცენზიო გადასახადი',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-19',
    name: 'ტრანსპორტირება',
    description: 'აპარატურის ან სამშენებლო მასალების ადგილზე მიტანა',
    plannedBudget: 1000,
    isAllowedGrant: true,
    comment: 'უნდა ახლდეს სატრანსპორტო ზედნადები RS.GE-დან',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-20',
    name: 'მონტაჟი',
    description: 'აპარატურის აწყობისა და გაშვება-გამართვის სამუშაოები',
    plannedBudget: 3000,
    isAllowedGrant: true,
    comment: 'მონტაჟის ხელშეკრულებისა და ტესტირების აქტის საფუძველზე',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-21',
    name: 'იურიდიული მომსახურება',
    description: 'ნებართვები, ხელშეკრულებების მომზადება/ექსპერტიზა',
    plannedBudget: 800,
    isAllowedGrant: true,
    comment: 'საწყისი იურიდიული მხარდაჭერა',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-22',
    name: 'ბუღალტრული მომსახურება',
    description: 'გრანტის ანგარიშგების და ბუღალტერიის წარმოება',
    plannedBudget: 1500,
    isAllowedGrant: true,
    comment: 'ყოველთვიური მომსახურება პროექტის მიმდინარეობისას',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-23',
    name: 'საბანკო საკომისიოები',
    description: 'ბანკის ტრანზაქციების საკომისიოები',
    plannedBudget: 300,
    isAllowedGrant: true,
    comment: 'ბანკის ამონაწერების საფუძველზე',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-24',
    name: 'ხელფასები',
    description: 'დასაქმებული პერსონალის ხელფასები',
    plannedBudget: 4000,
    isAllowedGrant: true,
    comment: 'დეკლარაციები და საშემოსავლო უწყისები',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-25',
    name: 'ფიზიკურ პირთან გაფორმებული მომსახურება',
    description: 'სხვადასხვა ხელოსნების და დამხმარე მუშახელის ანაზღაურება',
    plannedBudget: 3500,
    isAllowedGrant: true,
    comment: 'საჭიროებს საშემოსავლო 20% და საპენსიო 2%+2% დაკავებას',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-26',
    name: 'გაუთვალისწინებელი ხარჯი',
    description: 'ფორსმაჟორული ან დაუგეგმავი ტექნიკური ხარჯები',
    plannedBudget: 2000,
    isAllowedGrant: true,
    comment: 'მხოლოდ ადმინისტრაციის წერილობითი დასტურით',
    createdAt: '2026-05-01T09:00:00Z'
  },
  {
    id: 'cat-27',
    name: 'სხვა',
    description: 'ნებისმიერი ხარჯი, რომელიც არ შედის სხვა კატეგორიაში',
    plannedBudget: 1000,
    isAllowedGrant: true,
    comment: 'მოითხოვს დეტალურ აღწერას',
    createdAt: '2026-05-01T09:00:00Z'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'შპს სამშენებლო ძალა 2020',
    type: 'company',
    taxId: '404555888',
    phone: '599112233',
    email: 'info@stroy-power.ge',
    createdAt: '2026-05-02T10:00:00Z'
  },
  {
    id: 'sup-2',
    name: 'შპს ევრო სამრეცხაო ტექნიკა',
    type: 'company',
    taxId: '205444999',
    phone: '595889900',
    email: 'sales@carwash-tech.ge',
    createdAt: '2026-05-03T11:30:00Z'
  },
  {
    id: 'sup-3',
    name: 'შპს სუფთა წყლის ფილტრები',
    type: 'company',
    taxId: '401333222',
    phone: '577445566',
    email: 'water@filter.ge',
    createdAt: '2026-05-04T12:00:00Z'
  },
  {
    id: 'sup-4',
    name: 'ავთანდილ გობრონიძე (ხელოსანი)',
    type: 'individual',
    taxId: '01024033344',
    phone: '551778899',
    email: 'avto.gobro@gmail.com',
    createdAt: '2026-05-05T09:00:00Z'
  },
  {
    id: 'sup-5',
    name: 'შპს ბიზნეს და ფინანსური პარტნიორი',
    type: 'company',
    taxId: '402001122',
    phone: '322998877',
    email: 'accounting@bfp.ge',
    createdAt: '2026-05-06T15:00:00Z'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'ბეტონის მოედნისა და იატაკის დასხმა',
    description: '3 ბოქსის ბეტონის ბაზის მოწყობა, არმირება, დახრილობებისა და სადრენაჟო ტრაპების ჩაშენება',
    categoryId: 'cat-3', // ბეტონი, იატაკი, სადრენაჟო სამუშაოები
    supplierId: 'sup-1', // შპს სამშენებლო ძალა 2020
    trancheId: 'tr-1',
    invoiceNumber: 'RS-99882211',
    invoiceDate: '2026-05-18', // after tranche_1
    amountNoVat: 10169.49,
    vat: 1830.51,
    amountWithVat: 12000.00,
    responsiblePerson: 'დავით კობახიძე',
    projectStage: 'ეტაპი 1 - საძირკველი და მოედანი',
    internalComment: 'სამუშაოები დასრულდა ხარისხიანად, ზედაპირი მოიხვეწა ვერტმფრენით.',
    status: ExpenseStatus.Approved,
    createdAt: '2026-05-18T14:30:00Z',
    createdBy: 'u-3',
    updatedAt: '2026-05-20T12:00:00Z',
    updatedBy: 'u-1'
  },
  {
    id: 'exp-2',
    title: 'მაღალი წნევის აპარატურის შესყიდვა (3 ბოქსი)',
    description: '3 კომპლექტი მაღალი წნევის იტალიური ტუმბოებით (Hawk) და ელექტროძრავებით, პულტებით',
    categoryId: 'cat-10', // მაღალი წნევის აპარატები
    supplierId: 'sup-2', // შპს ევრო სამრეცხაო ტექნიკა
    trancheId: 'tr-1',
    invoiceNumber: 'RS-10022441',
    invoiceDate: '2026-05-28',
    amountNoVat: 12711.86,
    vat: 2288.14,
    amountWithVat: 15000.00,
    responsiblePerson: 'დავით კობახიძე',
    projectStage: 'ეტაპი 2 - აპარატურა',
    internalComment: 'დოკუმენტები გამოგზავნილია, თუმცა ბანკის მეორე გადარიცხვის ქვითარი დასაზუსტებელია.',
    status: ExpenseStatus.AccountantReview,
    createdAt: '2026-05-28T10:15:00Z',
    createdBy: 'u-3',
    updatedAt: '2026-05-29T16:45:00Z',
    updatedBy: 'u-3'
  },
  {
    id: 'exp-3',
    title: 'მიწის მოსწორება და გათხრითი სამუშაოები',
    description: 'ტერიტორიის გათავისუფლება ნამსხვრევებისგან, მოსწორება ექსკავატორით',
    categoryId: 'cat-1', // მიწის/ტერიტორიის მომზადება
    supplierId: 'sup-1', // შპს სამშენებლო ძალა 2020
    trancheId: 'tr-1',
    invoiceNumber: 'RS-991122',
    invoiceDate: '2026-05-05', // WARNING: BEFORE Tranche 1 date (2026-05-10)
    amountNoVat: 3389.83,
    vat: 610.17,
    amountWithVat: 4000.00,
    responsiblePerson: 'დავით კობახიძე',
    projectStage: 'ეტაპი 1 - მოსამზადებელი',
    internalComment: 'ყურადღება: თარიღი არის პირველ ტრანშამდე! უნდა გადამოწმდეს „აწარმოე საქართველოს“ კოორდინატორთან.',
    status: ExpenseStatus.NeedsCorrection,
    createdAt: '2026-05-06T11:00:00Z',
    createdBy: 'u-3',
    updatedAt: '2026-05-12T09:00:00Z',
    updatedBy: 'u-2'
  },
  {
    id: 'exp-4',
    title: 'წყლის ფილტრაციისა და დამარბილებელი სისტემა',
    description: 'ავტომატური ფილტრი-დამარბილებელი და ნახშირის ფილტრები ქვიშის საწინააღმდეგოდ',
    categoryId: 'cat-13', // წყლის ფილტრაცია/დამარბილებელი სისტემა
    supplierId: 'sup-3', // შპს სუფთა წყლის ფილტრები
    trancheId: 'tr-2',
    invoiceNumber: 'RS-10223399',
    invoiceDate: '2026-06-20',
    amountNoVat: 4237.29,
    vat: 762.71,
    amountWithVat: 5000.00,
    responsiblePerson: 'დავით კობახიძე',
    projectStage: 'ეტაპი 3 - დამხმარე სისტემები',
    internalComment: 'ფილტრები წარმატებით დამონტაჟდა. ველოდებით საბოლოო მიღება-ჩაბარების აქტის ხელმოწერას.',
    status: ExpenseStatus.DocumentsMissing,
    createdAt: '2026-06-21T12:00:00Z',
    createdBy: 'u-3',
    updatedAt: '2026-06-21T12:00:00Z',
    updatedBy: 'u-3'
  },
  {
    id: 'exp-5',
    title: 'მეტალოკონსტრუქციის შეკვრა (3 ბოქსის ჩონჩხი)',
    description: 'ბოქსების რკინის სვეტებისა და თაღების შედუღება ადგილზე',
    categoryId: 'cat-7', // მეტალოკონსტრუქცია
    supplierId: 'sup-4', // ავთანდილ გობრონიძე (ხელოსანი)
    trancheId: 'tr-2',
    invoiceNumber: 'CTR-2026-05',
    invoiceDate: '2026-06-18',
    amountNoVat: 6000.00, // No VAT since supplier is an individual
    vat: 0,
    amountWithVat: 6000.00,
    responsiblePerson: 'დავით კობახიძე',
    projectStage: 'ეტაპი 1 - კონსტრუქცია',
    internalComment: 'ფიზიკური პირია. საშემოსავლო გადასახადი 20% უნდა გადავიხადოთ ბიუჯეტში.',
    status: ExpenseStatus.Paid,
    createdAt: '2026-06-18T15:30:00Z',
    createdBy: 'u-3',
    updatedAt: '2026-06-22T10:00:00Z',
    updatedBy: 'u-2'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    expenseId: 'exp-1', // Concrete Floor
    paymentDate: '2026-05-19',
    amount: 12000.00,
    paymentMethod: 'bank',
    payerAccount: 'GE55TB111222333444555',
    recipientName: 'შპს სამშენებლო ძალა 2020',
    purpose: 'სამშენებლო სამუშაოების ანაზღაურება, ხელშეკრულება #12, RS-99882211',
    bankTxNumber: 'TXN-9981122',
    fee: 0.50,
    receiptFile: 'receipt_concrete_floor_approved.pdf',
    comment: 'გადარიცხვა განხორციელდა პირველი ტრანშიდან. დამტკიცებულია.',
    checkedBy: 'ნინო ხარატიშვილი',
    status: 'approved',
    createdAt: '2026-05-19T10:00:00Z'
  },
  {
    id: 'pay-2',
    expenseId: 'exp-2', // High Pressure Pump
    paymentDate: '2026-05-29',
    amount: 10000.00, // Partial payment 1
    paymentMethod: 'bank',
    payerAccount: 'GE55TB111222333444555',
    recipientName: 'შპს ევრო სამრეცხაო ტექნიკა',
    purpose: 'ავანსი მაღალი წნევის აპარატურის შესაძენად, ხელშეკრულება #15',
    bankTxNumber: 'TXN-1002233',
    fee: 0.50,
    receiptFile: 'advance_payment_receipt_carwash.pdf',
    comment: 'ავანსი 10,000 ლარი წარმატებით გადაირიცხა.',
    checkedBy: 'ნინო ხარატიშვილი',
    status: 'approved',
    createdAt: '2026-05-29T11:00:00Z'
  },
  {
    id: 'pay-3',
    expenseId: 'exp-2', // High Pressure Pump
    paymentDate: '2026-06-02',
    amount: 5000.00, // Partial payment 2
    paymentMethod: 'bank',
    payerAccount: 'GE55TB111222333444555',
    recipientName: 'შპს ევრო სამრეცხაო ტექნიკა',
    purpose: 'საბოლოო ანგარიშსწორება მაღალი წნევის აპარატურაზე, RS-10022441',
    bankTxNumber: 'TXN-1004455',
    fee: 0.50,
    receiptFile: 'final_payment_receipt_carwash.pdf',
    comment: 'ქვითარი ატვირთულია, თუმცა ბანკის ამონაწერის ასლია საჭირო.',
    checkedBy: 'නინო ხარატიშვილი',
    status: 'pending',
    createdAt: '2026-06-02T14:30:00Z'
  },
  {
    id: 'pay-4',
    expenseId: 'exp-3', // Land leveling
    paymentDate: '2026-05-06', // WARNING: Before Tranche 1
    amount: 4000.00,
    paymentMethod: 'bank',
    payerAccount: 'GE55TB111222333444555',
    recipientName: 'შპს სამშენებლო ძალა 2020',
    purpose: 'მოსამზადებელი გათხრითი სამუშაოების ღირებულება',
    bankTxNumber: 'TXN-9900221',
    fee: 0.50,
    receiptFile: 'receipt_excavator_before_tranche.pdf',
    comment: 'ყურადღება: გადახდილია ტრანშის მიღებამდე საკუთარი სახსრებით!',
    checkedBy: 'ნინო ხარატიშვილი',
    status: 'approved',
    createdAt: '2026-05-06T16:00:00Z'
  },
  {
    id: 'pay-5',
    expenseId: 'exp-5', // Metal structure welding
    paymentDate: '2026-06-22',
    amount: 4800.00, // 6000 gross - 20% tax (1200) = 4800 net paid to Avtandil
    paymentMethod: 'bank',
    payerAccount: 'GE55TB111222333444555',
    recipientName: 'ავთანდილ გობრონიძე',
    purpose: 'ხელშეკრულება CTR-2026-05 მეტალოკონსტრუქციის ხელფასი (ნეტო)',
    bankTxNumber: 'TXN-1022445',
    fee: 0.50,
    receiptFile: 'transfer_gobronidze_net.pdf',
    comment: 'ხელოსანს დაერიცხა სუფთა ხელზე 4800 ლარი. 1200 ლარი გადასარიცხია ბიუჯეტში საშემოსავლოდ.',
    checkedBy: 'ნინო ხარატიშვილი',
    status: 'approved',
    createdAt: '2026-06-22T11:15:00Z'
  }
];

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    expenseId: 'exp-1', // Concrete Floor
    docType: 'invoice',
    docNumber: 'RS-99882211',
    docDate: '2026-05-18',
    fileName: 'invoice_rs_99882211_concrete.pdf',
    fileSize: '345 KB',
    uploadDate: '2026-05-18T15:00:00Z',
    uploadedBy: 'დავით კობახიძე',
    status: 'active',
    amount: 12000.00,
    comment: 'ატვირთულია RS.GE-ს საგადასახადო ანგარიშ-ფაქტურა.',
    checksum: 'a8b3c9d4e2f102bc',
    version: 1
  },
  {
    id: 'doc-2',
    expenseId: 'exp-1', // Concrete Floor
    docType: 'contract',
    docNumber: 'AGR-2026-01',
    docDate: '2026-05-12',
    fileName: 'contract_stroy_power_flooring.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2026-05-13T10:00:00Z',
    uploadedBy: 'გიორგი იმედაშვილი',
    status: 'active',
    amount: 12000.00,
    comment: 'ძირითადი ხელშეკრულება მოედნის მშენებლობაზე.',
    checksum: '9d2e4f1a8c7b3e02',
    version: 1
  },
  {
    id: 'doc-3',
    expenseId: 'exp-1', // Concrete Floor
    docType: 'acceptance_act',
    docNumber: 'ACT-2026-01',
    docDate: '2026-05-18',
    fileName: 'acceptance_act_concrete_floor.pdf',
    fileSize: '512 KB',
    uploadDate: '2026-05-18T16:00:00Z',
    uploadedBy: 'დავით კობახიძე',
    status: 'active',
    amount: 12000.00,
    comment: 'ორმხრივად ხელმოწერილი მიღება-ჩაბარების აქტი.',
    checksum: 'ff3a89e17c0b2984',
    version: 1
  },
  {
    id: 'doc-4',
    expenseId: 'exp-2', // High Pressure Pump
    docType: 'invoice',
    docNumber: 'RS-10022441',
    docDate: '2026-05-28',
    fileName: 'invoice_rs_10022441_carwash.pdf',
    fileSize: '412 KB',
    uploadDate: '2026-05-28T11:00:00Z',
    uploadedBy: 'დავით კობახიძე',
    status: 'active',
    amount: 15000.00,
    comment: 'RS.GE საგადასახადო ანგარიშ-ფაქტურა.',
    checksum: '88bc391adbe49102',
    version: 1
  },
  {
    id: 'doc-5',
    expenseId: 'exp-2', // High Pressure Pump
    docType: 'contract',
    docNumber: 'AGR-2026-02',
    docDate: '2026-05-14',
    fileName: 'contract_carwash_equipment_hawkn.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-05-14T12:00:00Z',
    uploadedBy: 'გიორგი იმედაშვილი',
    status: 'active',
    amount: 15000.00,
    comment: 'აპარატურის მოწოდების და მონტაჟის ხელშეკრულება.',
    checksum: 'ee71928bc8310efc',
    version: 1
  },
  {
    id: 'doc-6',
    expenseId: 'exp-3', // Land leveling
    docType: 'invoice',
    docNumber: 'RS-991122',
    docDate: '2026-05-05', // WARNING: BEFORE Tranche 1
    fileName: 'invoice_rs_991122_excavator.pdf',
    fileSize: '298 KB',
    uploadDate: '2026-05-06T09:30:00Z',
    uploadedBy: 'დავით კობახიძე',
    status: 'active',
    amount: 4000.00,
    comment: 'ატვირთულია, თუმცა ბუღალტერი აფრთხილებს თარიღის გამო.',
    checksum: 'c819d71adfe0210e',
    version: 1
  },
  {
    id: 'doc-7',
    expenseId: 'exp-5', // Metal structure
    docType: 'contract',
    docNumber: 'CTR-2026-05',
    docDate: '2026-06-18',
    fileName: 'contract_gobronidze_welding.pdf',
    fileSize: '780 KB',
    uploadDate: '2026-06-18T15:45:00Z',
    uploadedBy: 'დავით კობახიძე',
    status: 'active',
    amount: 6000.00,
    comment: 'მომსახურების ხელშეკრულება ფიზიკურ პირთან.',
    checksum: '3a4c5e6f7a8b9c0d',
    version: 1
  },
  {
    id: 'doc-8',
    expenseId: 'exp-5', // Metal structure
    docType: 'acceptance_act',
    docNumber: 'ACT-2026-05',
    docDate: '2026-06-22',
    fileName: 'acceptance_act_metal_structure.pdf',
    fileSize: '430 KB',
    uploadDate: '2026-06-22T11:00:00Z',
    uploadedBy: 'დავით კობახიძე',
    status: 'active',
    amount: 6000.00,
    comment: 'შესრულებული სამუშაოს მიღება-ჩაბარების აქტი.',
    checksum: '6789abcdef123456',
    version: 1
  }
];

export const INITIAL_PAYROLL_SERVICES: PayrollOrIndividualService[] = [
  {
    id: 'payr-1',
    name: 'ავთანდილ გობრონიძე',
    personalId: '01024033344',
    workDescription: 'სამრეცხაოს რკინის ბოქსების კონსტრუქციის შედუღება და აწყობა',
    contractNumber: 'CTR-2026-05',
    contractDate: '2026-06-18',
    startDate: '2026-06-18',
    endDate: '2026-06-22',
    grossAmount: 6000,
    netAmount: 4800, // 20% income tax subtracted
    taxesAmount: 1200,
    pensionDeduction: 0, // Not applicable for freelance contract if they didn't request
    paymentDate: '2026-06-22',
    hasAcceptanceAct: true,
    hasPaymentDoc: true,
    accountantComment: 'გადახდილია ხელზე 4,800 GEL. 1,200 GEL საშემოსავლო დეკლარირებულია და გადახდილია ბიუჯეტში.',
    createdAt: '2026-06-18T15:30:00Z'
  },
  {
    id: 'payr-2',
    name: 'ირაკლი კალანდაძე',
    personalId: '54001044455',
    workDescription: 'სამრეცხაო პოსტების ელექტრო გაყვანილობა და ფარების მონტაჟი',
    contractNumber: 'CTR-2026-09',
    contractDate: '2026-07-02',
    startDate: '2026-07-03',
    endDate: '2026-07-07',
    grossAmount: 2000,
    netAmount: 1520, // 20% tax (400) + 2% employee pension (40) + 2% employer (40)
    taxesAmount: 400,
    pensionDeduction: 80, // Employee 2% + Employer 2%
    hasAcceptanceAct: false,
    hasPaymentDoc: false,
    accountantComment: 'სამუშაო მიმდინარეობს, ხელშეკრულება ატვირთულია. დასრულებისას საჭიროა მიღება-ჩაბარების აქტი.',
    createdAt: '2026-07-02T10:00:00Z'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    expenseId: 'exp-3', // Land leveling
    userName: 'ნინო ხარატიშვილი',
    userRole: 'accountant',
    text: 'ყურადღება: ამ ხარჯის საგადასახადო ანგარიშ-ფაქტურა თარიღდება 2026-05-05-ით, რაც პირველ ტრანშამდეა (2026-05-10). გრანტის პირობებით, ტრანშამდე გაწეული ხარჯების ანაზღაურება საეჭვოა. გთხოვთ დააზუსტოთ გრანტის კოორდინატორთან!',
    createdAt: '2026-05-12T09:15:00Z'
  },
  {
    id: 'com-2',
    expenseId: 'exp-3', // Land leveling
    userName: 'დავით კობახიძე',
    userRole: 'manager',
    text: 'გასაგებია. ეს სამუშაოები სასწრაფო იყო ექსკავატორის მოცდენის თავიდან ასაცილებლად. ველოდებით მფლობელის პასუხს კოორდინატორიდან.',
    createdAt: '2026-05-12T11:30:00Z'
  },
  {
    id: 'com-3',
    expenseId: 'exp-2', // Pumps
    userName: 'ნინო ხარატიშვილი',
    userRole: 'accountant',
    text: 'მეორე შუალედური გადახდის ქვითარი (5,000 ლარი) არის დაუდასტურებელ სტატუსში, რადგან PDF ფაილი გაურკვეველია. გთხოვთ ატვირთოთ ბანკის მკაფიო ამონაწერი.',
    createdAt: '2026-06-03T09:00:00Z'
  }
];

export const INITIAL_STATUS_HISTORY: StatusHistory[] = [
  {
    id: 'h-1',
    expenseId: 'exp-1',
    fromStatus: ExpenseStatus.Draft,
    toStatus: ExpenseStatus.AccountantReview,
    changedBy: 'დავით კობახიძე',
    changeDate: '2026-05-18T16:15:00Z',
    comment: 'დოკუმენტები სრულად აიტვირთა. გადაეცემა ბუღალტერს შესამოწმებლად.'
  },
  {
    id: 'h-2',
    expenseId: 'exp-1',
    fromStatus: ExpenseStatus.AccountantReview,
    toStatus: ExpenseStatus.Approved,
    changedBy: 'გიორგი იმედაშვილი',
    changeDate: '2026-05-20T12:00:00Z',
    comment: 'ბუღალტერმა დაადასტურა დოკუმენტების სისრულე. ხარჯი დამტკიცებულია!'
  },
  {
    id: 'h-3',
    expenseId: 'exp-3',
    fromStatus: ExpenseStatus.Draft,
    toStatus: ExpenseStatus.NeedsCorrection,
    changedBy: 'ნინო ხარატიშვილი',
    changeDate: '2026-05-12T09:00:00Z',
    comment: 'გადაგზავნილია შესასწორებლად. თარიღი ტრანშამდეა.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userName: 'დავით კობახიძე',
    userRole: 'manager',
    action: 'ხარჯის დამატება',
    details: 'დაემატა ახალი ხარჯი: „ბეტონის მოედნისა და იატაკის დასხმა“ (ხარჯი ID: exp-1), თანხა: 12,000.00 GEL',
    timestamp: '2026-05-18T14:30:00Z',
    ipAddress: '192.168.1.105',
    device: 'Chrome on Windows 11'
  },
  {
    id: 'log-2',
    userName: 'დავით კობახიძე',
    userRole: 'manager',
    action: 'დოკუმენტის ატვირთვა',
    details: 'ატვირთულია საგადასახადო ანგარიშ-ფაქტურა „invoice_rs_99882211_concrete.pdf“ ხარჯზე exp-1',
    timestamp: '2026-05-18T15:00:00Z',
    ipAddress: '192.168.1.105',
    device: 'Chrome on Windows 11'
  },
  {
    id: 'log-3',
    userName: 'ნინო ხარატიშვილი',
    userRole: 'accountant',
    action: 'ხარჯის დაბრუნება',
    details: 'ხარჯი exp-3 მონიშნულია შესასწორებლად (Needs Correction), კომენტარით: თარიღი ტრანშამდეა.',
    timestamp: '2026-05-12T09:00:00Z',
    ipAddress: '192.168.1.55',
    device: 'Safari on macOS'
  },
  {
    id: 'log-4',
    userName: 'გიორგი იმედაშვილი',
    userRole: 'admin',
    action: 'ხარჯის დამტკიცება',
    details: 'დამტკიცდა ხარჯი exp-1 ბუღალტრის დადებითი დასკვნის შემდეგ.',
    timestamp: '2026-05-20T12:00:00Z',
    ipAddress: '178.134.45.12',
    device: 'Chrome on macOS'
  },
  {
    id: 'log-5',
    userName: 'გიორგი იმედაშვილი',
    userRole: 'admin',
    action: 'ავტორიზაცია',
    details: 'მომხმარებელი წარმატებით შევიდა სისტემაში როლით: Admin',
    timestamp: '2026-07-08T13:39:00Z',
    ipAddress: '178.134.45.12',
    device: 'Chrome on macOS'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    type: 'warning',
    message: 'ხარჯზე „მიწის მოსწორება და გათხრითი სამუშაოები“ დოკუმენტის თარიღი (2026-05-05) ტრანშამდეა. გადაამოწმეთ ბუღალტერთან!',
    isRead: false,
    createdAt: '2026-05-12T09:05:00Z',
    expenseId: 'exp-3'
  },
  {
    id: 'not-2',
    type: 'info',
    message: 'ბუღალტერმა ნინო ხარატიშვილმა დააბრუნა შესასწორებლად ხარჯი: „მიწის მოსწორება და გათხრითი სამუშაოები“',
    isRead: false,
    createdAt: '2026-05-12T09:00:00Z',
    expenseId: 'exp-3'
  },
  {
    id: 'not-3',
    type: 'warning',
    message: 'ხარჯს „წყლის ფილტრაციისა და დამარბილებელი სისტემა“ აკლია მიღება-ჩაბარების აქტი!',
    isRead: false,
    createdAt: '2026-06-21T12:05:00Z',
    expenseId: 'exp-4'
  },
  {
    id: 'not-4',
    type: 'info',
    message: 'პროექტის ბიუჯეტი (50,000 GEL) ათვისებულია 78%-ით. დარჩენილია 11,000.00 GEL.',
    isRead: false,
    createdAt: '2026-07-08T09:00:00Z'
  }
];
