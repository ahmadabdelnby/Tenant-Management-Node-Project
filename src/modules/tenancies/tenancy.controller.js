const tenancyService = require('./tenancy.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');
const PDFDocument = require('pdfkit');
const fs = require('fs');

function resolveArabicFontPath() {
  const candidates = [
    process.env.ARABIC_PDF_FONT_PATH,
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\arialuni.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf',
  ].filter(Boolean);

  return candidates.find((fontPath) => fs.existsSync(fontPath)) || null;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDateForContract(dateValue) {
  if (!dateValue) return '___________________';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '___________________';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const toArabicDigits = (value) => String(value).replace(/\d/g, (digit) => arabicDigits[Number(digit)]);
  const day = toArabicDigits(String(date.getDate()).padStart(2, '0'));
  const month = toArabicDigits(String(date.getMonth() + 1).padStart(2, '0'));
  const year = toArabicDigits(String(date.getFullYear()));

  return `${day} / ${month} / ${year}`;
}

function formatWeekdayForContract(dateValue) {
  if (!dateValue) return '___________________';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '___________________';

  return new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date);
}

function normalizeContractValue(value, fallback = '___________________') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
}

function getTenancyPartyName(tenancy) {
  return (
    tenancy.secondPartyName ||
    `${tenancy.tenant?.firstName || ''} ${tenancy.tenant?.lastName || ''}`.trim() ||
    '___________________'
  );
}

function getRepresentativeName(tenancy) {
  return tenancy.secondPartyRepresentativeName || '___________________';
}

function writeContractField(doc, label, value, options = {}) {
  const fontSize = options.fontSize || 12;
  const valueFontSize = options.valueFontSize || 12;
  const afterGap = options.afterGap || 0.35;
  const valueAlign = options.valueAlign || 'center';

  doc.fontSize(fontSize).text(`${label} /`, { align: 'right' });
  doc.moveDown(0.12);
  doc.fontSize(valueFontSize).text(normalizeContractValue(value, options.fallback || '___________________'), {
    align: valueAlign,
  });
  doc.moveDown(afterGap);
}

function writeContractParagraph(doc, text, options = {}) {
  doc.fontSize(options.fontSize || 11).text(text, {
    align: 'right',
    lineGap: options.lineGap || 4,
  });
  doc.moveDown(options.afterGap || 0.25);
}

function writeContractClause(doc, title, body, options = {}) {
  doc.fontSize(options.titleSize || 12).text(title, { align: 'right' });
  doc.moveDown(0.15);
  doc.fontSize(options.bodySize || 11).text(body, {
    align: 'right',
    lineGap: options.lineGap || 4,
  });
  doc.moveDown(options.afterGap || 0.45);
}

function convertHundreds(number) {
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  const parts = [];
  const hundredPart = Math.floor(number / 100);
  const remainder = number % 100;

  if (hundredPart) {
    parts.push(hundreds[hundredPart]);
  }

  if (remainder >= 20) {
    const tenPart = Math.floor(remainder / 10);
    const unitPart = remainder % 10;
    if (unitPart) {
      parts.push(`${units[unitPart]} و${tens[tenPart]}`);
    } else {
      parts.push(tens[tenPart]);
    }
  } else if (remainder >= 10) {
    parts.push(teens[remainder - 10]);
  } else if (remainder > 0) {
    parts.push(units[remainder]);
  }

  return parts.filter(Boolean).join(' و');
}

function numberToArabicWords(number) {
  const value = Math.floor(Math.abs(Number(number) || 0));
  if (value === 0) return 'صفر';

  const scales = ['', 'ألف', 'مليون', 'مليار'];
  const groups = [];
  let remaining = value;

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const words = groups.map((group, index) => {
    if (!group) return '';
    const groupWords = convertHundreds(group);
    const scale = scales[index];

    if (!scale) return groupWords;
    if (index === 1) {
      if (group === 1) return 'ألف';
      if (group === 2) return 'ألفان';
      if (group >= 3 && group <= 10) return `${groupWords} آلاف`;
      return `${groupWords} ألف`;
    }
    if (index === 2) {
      if (group === 1) return 'مليون';
      if (group === 2) return 'مليونان';
      if (group >= 3 && group <= 10) return `${groupWords} ملايين`;
      return `${groupWords} مليون`;
    }
    if (index === 3) {
      if (group === 1) return 'مليار';
      if (group === 2) return 'ملياران';
      if (group >= 3 && group <= 10) return `${groupWords} مليارات`;
      return `${groupWords} مليار`;
    }

    return `${groupWords} ${scale}`;
  }).filter(Boolean).reverse();

  return words.join(' و');
}

function amountToWords(amount) {
  const numericAmount = Number(amount || 0);
  const whole = Math.floor(numericAmount);
  const fraction = Math.round((numericAmount - whole) * 1000);
  const wholeWords = numberToArabicWords(whole);

  if (!fraction) {
    return `${wholeWords} دينار كويتي لا غير`;
  }

  return `${wholeWords} دينار كويتي و${numberToArabicWords(fraction)} فلس لا غير`;
}

/**
 * Tenancy Controller
 */
const tenancyController = {
  /**
   * Get all tenancies
   * GET /api/tenancies
   */
  async getAll(req, res, next) {
    try {
      const { page, limit } = parsePaginationParams(req.query);
      const { unitId, buildingId, isActive } = req.query;
      
      const filters = {};
      if (unitId) filters.unitId = parseInt(unitId);
      if (buildingId) filters.buildingId = parseInt(buildingId);
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const result = await tenancyService.getAllTenancies(page, limit, filters, req.user);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Tenancies retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get tenancy by ID
   * GET /api/tenancies/:id
   */
  async getById(req, res, next) {
    try {
      const tenancy = await tenancyService.getTenancyById(
        parseInt(req.params.id),
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(tenancy, 'Tenancy retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create tenancy
   * POST /api/tenancies
   */
  async create(req, res, next) {
    try {
      const tenancy = await tenancyService.createTenancy(req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        createdResponse(tenancy, 'Tenancy created successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update tenancy
   * PUT /api/tenancies/:id
   */
  async update(req, res, next) {
    try {
      const tenancy = await tenancyService.updateTenancy(
        parseInt(req.params.id),
        req.body
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(tenancy, 'Tenancy updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * End tenancy
   * PATCH /api/tenancies/:id/end
   */
  async end(req, res, next) {
    try {
      const result = await tenancyService.endTenancy(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Tenancy ended successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get my tenancies (for Tenant role)
   * GET /api/my-tenancies
   */
  async getMyTenancies(req, res, next) {
    try {
      const tenancies = await tenancyService.getMyTenancies(req.user.id);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(tenancies, 'Tenancies retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete tenancy
   * DELETE /api/tenancies/:id
   */
  async delete(req, res, next) {
    try {
      const result = await tenancyService.deleteTenancy(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Tenancy deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export tenancy as contract document
   * GET /api/tenancies/:id/export-contract
   */
  async exportContract(req, res, next) {
    try {
      const tenancy = await tenancyService.getTenancyById(parseInt(req.params.id), req.user);

      if (!tenancy) {
        throw new Error('Tenancy not found');
      }

      const fontPath = resolveArabicFontPath();
      const doc = new PDFDocument({ size: 'A4', margin: 42, bufferPages: true });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="contract_${tenancy.contractNumber || tenancy.id}.pdf"`);
      doc.pipe(res);

      if (fontPath) {
        doc.font(fontPath);
      }

      doc.fontSize(18).font(fontPath || 'Helvetica').text('عقد إيجار', {
        align: 'center',
      });
      doc.moveDown(0.6);

      const contractDate = tenancy.contractDate || tenancy.createdAt;
      const contractDateText = formatDateForContract(contractDate);
      const weekdayText = formatWeekdayForContract(contractDate);

      writeContractField(doc, 'رقم العقد', tenancy.contractNumber || tenancy.id, { afterGap: 0.25 });
      writeContractField(doc, 'تاريخ التحرير', contractDateText, { afterGap: 0.25 });
      writeContractField(doc, 'يوم تحرير العقد', weekdayText, { afterGap: 0.25 });
      writeContractField(doc, 'الموافق', contractDateText, { afterGap: 0.45 });

      writeContractParagraph(
        doc,
        `إنه في يوم ${weekdayText} الموافق ${contractDateText} تم تحرير هذا العقد بين كل من:`,
        { afterGap: 0.55 }
      );

      doc.fontSize(13).text('أولاً: الطرف الأول', { align: 'right' });
      doc.moveDown(0.2);
      writeContractField(doc, 'الاسم', tenancy.firstPartyName, { afterGap: 0.3 });
      writeContractField(doc, 'الرقم المدني', tenancy.firstPartyId, { afterGap: 0.45 });

      doc.fontSize(13).text('ثانياً: الطرف الثاني', { align: 'right' });
      doc.moveDown(0.2);
      writeContractField(doc, 'الاسم', getTenancyPartyName(tenancy), { afterGap: 0.3 });
      writeContractField(doc, 'و يمثلهما', getRepresentativeName(tenancy), { afterGap: 0.3 });
      writeContractField(doc, 'الجنسية', tenancy.secondPartyRepresentativeNationality || tenancy.secondPartyNationality, { afterGap: 0.3 });
      writeContractField(doc, 'الرقم المدني', tenancy.secondPartyRepresentativeCivilId || tenancy.secondPartyId, { afterGap: 0.3 });
      writeContractField(doc, 'الهاتف', tenancy.secondPartyRepresentativePhone || tenancy.secondPartyPhone, { afterGap: 0.3 });
      writeContractField(doc, 'العنوان', tenancy.secondPartyRepresentativeAddress || tenancy.secondPartyAddress, { afterGap: 0.45 });

      writeContractParagraph(doc, 'وبعد أن أقر الطرفان بأهليتهما للتعاقد فقد تراضيا على ما يلي:', { afterGap: 0.55 });

      writeContractClause(
        doc,
        '### البند الأول',
        `أجر الطرف الأول للطرف الثاني ما هو محل سكني وفق البيانات التالية:\n\nرقم الوحدة /\n\n____________________\n\nالرقم الآلي للعنوان /\n\n____________________\n\nالكائن في:\n\nالمنطقة /\n\n______________\n\nقطعة /\n\n______________\n\nشارع /\n\n______________\n\nقسيمة رقم /\n\n______________\n\nالدور /\n\n______________`,
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الثاني',
        'تستعمل العين المؤجرة موضوع هذا العقد لغرض السكن ومن المعلوم للطرف الثاني أنه لا يحق له بأي حال من الأحوال أن يغير من طبيعة الغرض من استعمال العين دون علم أو موافقة الطرف الأول المسبقة والصريحة، ولا تثبت هذه الموافقة إلا بموجب تصريح كتابي من الطرف الأول يتيح له ذلك.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الثالث',
        `اتفق الطرفان على أن تكون الأجرة الشهرية بواقع ${normalizeContractValue(formatCurrency(tenancy.monthlyRent), '________________')} د.ك فقط ${normalizeContractValue(amountToWords(tenancy.monthlyRent), '____________________________________')} لا غير، تدفع مقدماً خلال العشرة أيام الأولى من بداية كل شهر وإلا صار العقد مفسوخاً من تلقاء نفسه دون الحاجة إلى تنبيه أو إنذار أو حكم قضائي.`,
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الرابع',
        `تبدأ مدة العقد من ${normalizeContractValue(formatDateForContract(tenancy.startDate), '  /  / ______')} وتنتهي في ${normalizeContractValue(formatDateForContract(tenancy.endDate), '  /  / ______')} وتجدد تلقائياً لمدة أو مدد مماثلة ما لم يخطر أحد الطرفين الطرف الآخر بعدم رغبته بالتجديد قبل شهرين على الأقل من انتهاء مدة العقد، ويلتزم الطرف الثاني بتسليم العين عند انتهاء التعاقد.`,
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الخامس',
        'يقر الطرف الثاني بأنه عاين العين محل هذا العقد بنفسه المعاينة التامة والنافية لأية جهالة، ووجدها على أحسن حال، ويقر أيضاً أن هذا المكان صالح للانتفاع الذي أجر من أجله من كل الوجوه، ولا يجوز للطرف الثاني الادعاء بخلاف ذلك بعد استلامه.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند السادس',
        'يحظر على الطرف الثاني حظراً باتاً إحداث أي تغيير، أو هدم، أو بناء، أو إزالة فتحات، أو إقامة مبانٍ أخرى، أو بناء حواجز أو حوائط ما لم يكن أي شيء من ذلك بموجب تصريح كتابي مسبق من الطرف الأول وبعد حصول الطرف الثاني على ترخيص بذلك من الجهات الرسمية، كما أن حصول الطرف الثاني على مثل ذلك الترخيص لا يلزم الطرف الأول بالموافقة على مثل هذه الأعمال إذا ما رأى غير ذلك.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند السابع',
        'يقر الطرف الثاني باتخاذه وشروط التخزين اللازمة والمتعارف عليها دولياً بحيث تكون البضاعة مخزنة بطريقة آمنة وجيدة ولا تحتوي على مواد ملتهبة أو قابلة للاشتعال أو التسريب أو يصدر منها روائح كريهة.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الثامن',
        'دفع تأمين الكهرباء واستهلاك الكهرباء والماء على حساب الطرف الأول فيما عدا لو حصلت أي مخالفة من قبل وزارة الكهرباء والماء تكون على مسئولية وحساب الطرف الثاني.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند التاسع',
        'إذا أجرى الطرف الثاني أي تحسين أو عمل في المأجور فليس له الحق بالمطالبة بقيمته، أو إتلافه أو إزالته، ويتعهد الطرف الثاني عند تركه للمأجور أن يسلمه للطرف الأول في حالة مرضية، وأن يقوم بتصليح جميع ما تلف منها أثناء إقامته.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند العاشر',
        'الطرف الأول غير مسئول عن أي ضرر يمكن أن يصيب الغير بسبب استغلال الطرف الثاني للمكان المؤجر، وتقع هذه المسئولية على الطرف الثاني الذي يتحمل وحده كل ضرر أو تلف بسبب الحوادث القهرية، والطرف الثاني مسئول من قبل الطرف الأول عن كل حريق يحدث في المكان المؤجر مهما كانت الأسباب، وعلى الطرف الثاني أن يؤمن فوراً لدى إحدى شركات التأمين طوال مدة عقد الإيجار ضد الحريق والحوادث التي يمكن أن تصيب الغير في نفسه أو ممتلكاته أو تلحق أية أضرار بمباني أو ممتلكات الطرف الأول.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الحادي عشر',
        'يحظر على الطرف الثاني حظراً باتاً التنازل عن الإيجار، أو إعادة تأجير العين المؤجرة للغير ما لم يكن هناك موافقة خطية مسبقة وصريحة من الطرف الأول، ويقع باطلاً كل تصرف يصدر عن الطرف الثاني دون الحصول على هذه الموافقة الخطية المسبقة من الطرف الأول.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الثاني عشر',
        'يتعهد الطرف الثاني بالمحافظة على سلامة ونظافة المأجور وصيانته، ويكون مسئولاً عن كل ضرر فيه ويتحتم عليه إصلاحه على حسابه الخاص بما في ذلك الزجاج، والأدوات الصحية، والمجاري والمفاتيح.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الثالث عشر',
        'في حالة مخالفة الطرف الثاني لأي شرط من شروط هذا العقد، فإن هذا العقد يعتبر مفسوخاً من تلقاء نفسه دون حاجة لإنذار، أو حكم قضائي مع حفظ حق الطرف الأول في الرجوع على الطرف الثاني بكامل الأجرة المستحقة عن المدة الباقية من العقد.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الرابع عشر',
        'يقر الطرف الثاني بأنه اتخذ العين المؤجرة موضوع هذا العقد محلاً مختاراً له بحيث يعتبر كل إعلان أو خطاب يرسل له فيها من الطرف الأول إعلاناً قانونياً.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند الخامس عشر',
        'يحظر على الطرف الثاني تقديم التبغ ومشتقاته أو تقديم الشيشة (الأرجيلة) داخل العين.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند السادس عشر',
        'تختص محاكم دولة الكويت بالفصل في أية نزاع قد ينشأ عن هذا العقد.',
        { afterGap: 0.5, lineGap: 4 }
      );

      writeContractClause(
        doc,
        '### البند السابع عشر',
        'حرر هذا العقد من نسختين أصليتين بيد كل طرف نسخة للعمل بموجبها عند اللزوم.',
        { afterGap: 0.8, lineGap: 4 }
      );

      doc.moveDown(0.3);
      doc.fontSize(13).text('### الطرف الأول', { align: 'right' });
      doc.moveDown(0.2);
      writeContractField(doc, 'الاسم', '____________________________', { afterGap: 0.3 });
      writeContractField(doc, 'التوقيع', '__________________________', { afterGap: 0.45 });

      doc.fontSize(13).text('### الطرف الثاني', { align: 'right' });
      doc.moveDown(0.2);
      writeContractField(doc, 'الاسم', '____________________________', { afterGap: 0.3 });
      writeContractField(doc, 'التوقيع', '__________________________', { afterGap: 0.45 });

      doc.end();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = tenancyController;
