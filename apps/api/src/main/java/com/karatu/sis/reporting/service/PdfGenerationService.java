package com.karatu.sis.reporting.service;

import com.karatu.sis.reporting.domain.ReportSnapshot;
import com.karatu.sis.reporting.domain.ReportSnapshotResult;
import com.karatu.sis.tenant.domain.School;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfGenerationService {

    private final TemplateEngine templateEngine;

    public PdfGenerationService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generateReportCardPdf(ReportSnapshot snapshot, List<ReportSnapshotResult> results, School school) {
        Context context = new Context();
        context.setVariable("snapshot", snapshot);
        context.setVariable("results", results);
        context.setVariable("student", snapshot.getStudent());
        context.setVariable("academicYear", snapshot.getAcademicYear());
        context.setVariable("term", snapshot.getTerm());
        context.setVariable("school", school);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        String publishedDate = snapshot.getPublishedAt() != null ? snapshot.getPublishedAt().format(formatter) : "Draft";
        context.setVariable("publishedDate", publishedDate);

        String html = templateEngine.process("report-card", context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, "");
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report card", e);
        }
    }
}
