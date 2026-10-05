package com.karatu.sis;

import com.karatu.sis.tenant.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.UUID;

@Component
@Profile("test")
class TestTenantContextInterceptor implements HandlerInterceptor, WebMvcConfigurer {
    private static final UUID CAREPOINT_SCHOOL_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        TenantContext.setSchoolId(CAREPOINT_SCHOOL_ID);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.setSchoolId(CAREPOINT_SCHOOL_ID);
    }
}
