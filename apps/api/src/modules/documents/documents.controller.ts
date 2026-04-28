import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import type {
  CreateDocumentPublicationInput,
  CreateDocumentSignatureRequestInput,
  CreateDocumentTemplateInput,
  CreatePronusDocumentInput,
  UpdateDocumentPublicationInput,
  UpdateDocumentSignatureRequestInput,
  UpdateDocumentTemplateInput,
  UpdatePronusDocumentInput,
} from "./documents.types";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get("summary")
  getSummary() {
    return this.documentsService.getSummary();
  }

  @Get()
  listDocuments() {
    return this.documentsService.listDocuments();
  }

  @Post()
  createDocument(@Body() body: CreatePronusDocumentInput) {
    return this.documentsService.createDocument(body);
  }

  @Patch(":id")
  updateDocument(@Param("id") id: string, @Body() body: UpdatePronusDocumentInput) {
    return this.documentsService.updateDocument(id, body);
  }

  @Get("templates")
  listTemplates() {
    return this.documentsService.listTemplates();
  }

  @Post("templates")
  createTemplate(@Body() body: CreateDocumentTemplateInput) {
    return this.documentsService.createTemplate(body);
  }

  @Patch("templates/:id")
  updateTemplate(@Param("id") id: string, @Body() body: UpdateDocumentTemplateInput) {
    return this.documentsService.updateTemplate(id, body);
  }

  @Get("publications")
  listPublications() {
    return this.documentsService.listPublications();
  }

  @Post("publications")
  createPublication(@Body() body: CreateDocumentPublicationInput) {
    return this.documentsService.createPublication(body);
  }

  @Patch("publications/:id")
  updatePublication(@Param("id") id: string, @Body() body: UpdateDocumentPublicationInput) {
    return this.documentsService.updatePublication(id, body);
  }

  @Get("signatures")
  listSignatures() {
    return this.documentsService.listSignatures();
  }

  @Post("signatures")
  createSignatureRequest(@Body() body: CreateDocumentSignatureRequestInput) {
    return this.documentsService.createSignatureRequest(body);
  }

  @Patch("signatures/:id")
  updateSignatureRequest(
    @Param("id") id: string,
    @Body() body: UpdateDocumentSignatureRequestInput,
  ) {
    return this.documentsService.updateSignatureRequest(id, body);
  }
}
