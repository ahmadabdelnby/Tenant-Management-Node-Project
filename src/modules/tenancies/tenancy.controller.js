const tenancyService = require('./tenancy.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, convertInchesToTwip, AlignmentType, UnderlineType } = require('docx');

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
      const { Tenancy, Unit, Building, User } = require('../../models');

      // Fetch tenancy with full associations
      const tenancy = await Tenancy.findByPk(parseInt(req.params.id), {
        include: [
          {
            model: Unit,
            as: 'unit',
            include: [{
              model: Building,
              as: 'building',
              attributes: ['id', 'name_en', 'name_ar'],
            }],
          },
          {
            model: User,
            as: 'tenant',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      if (!tenancy) {
        throw new Error('Tenancy not found');
      }

      // Generate Word document
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: 'عقد الإيجار',
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              run: new TextRun({
                bold: true,
                size: 32,
              }),
            }),

            // Contract header info
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('رقم العقد')] }),
                    new TableCell({ children: [new Paragraph(tenancy.id.toString())] }),
                    new TableCell({ children: [new Paragraph('التاريخ')] }),
                    new TableCell({ children: [new Paragraph(new Date().toLocaleDateString('ar-EG'))] }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { after: 200 } }),

            // First party
            new Paragraph({
              text: 'الطرف الأول (المؤجر)',
              bold: true,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `الاسم: ${tenancy.first_party_name || '___________________'}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `رقم الهوية: ${tenancy.first_party_id || '___________________'}`,
              spacing: { after: 200 },
            }),

            // Second party
            new Paragraph({
              text: 'الطرف الثاني (المستأجر)',
              bold: true,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `الاسم: ${tenancy.second_party_name || (tenancy.tenant ? tenancy.tenant.first_name + ' ' + tenancy.tenant.last_name : '___________________')}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `رقم الهوية: ${tenancy.second_party_id || '___________________'}`,
              spacing: { after: 200 },
            }),

            // Contract details
            new Paragraph({
              text: 'تفاصيل العقد',
              bold: true,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `المبنى: ${tenancy.unit?.building?.name_en || '___________________'}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `الوحدة: ${tenancy.unit?.unit_number || '___________________'}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `سعر الإيجار الشهري: ${tenancy.monthly_rent} د.ك`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `مدة التعاقد: ${tenancy.contract_duration || '___________________'}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `تاريخ البدء: ${new Date(tenancy.start_date).toLocaleDateString('ar-EG')}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `تاريخ الانتهاء: ${new Date(tenancy.end_date).toLocaleDateString('ar-EG')}`,
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: `مبلغ الضمان: ${tenancy.deposit_amount || '0'} د.ك`,
              spacing: { after: 200 },
            }),

            // Notes
            new Paragraph({
              text: 'ملاحظات العقد',
              bold: true,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: tenancy.contract_notes || 'لا توجد ملاحظات',
              spacing: { after: 300 },
            }),

            // Signature section
            new Paragraph({ text: '' }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph('توقيع المؤجر'),
                        new Paragraph(''),
                        new Paragraph('___________________'),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph('توقيع المستأجر'),
                        new Paragraph(''),
                        new Paragraph('___________________'),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="contract_${tenancy.id}.docx"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = tenancyController;
