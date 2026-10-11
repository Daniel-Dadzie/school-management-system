package com.karatu.sis.finance.api;

import com.karatu.sis.common.exception.ResourceConflictException;
import com.karatu.sis.finance.service.FinanceService;
import com.karatu.sis.auth.config.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class FinanceControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private FinanceService financeService;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(new FinanceController(financeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    public void reverseAdjustment_whenDuplicate_shouldReturn409() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID adjustmentId = UUID.randomUUID();

        when(financeService.reverseAdjustment(any(), any(), any()))
                .thenThrow(new ResourceConflictException("Adjustment has already been reversed"));

        mockMvc.perform(post("/api/v1/finance/adjustments/student/{studentId}/{adjustmentId}/reverse", studentId, adjustmentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\": \"Correction\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Adjustment has already been reversed"));
    }
}
