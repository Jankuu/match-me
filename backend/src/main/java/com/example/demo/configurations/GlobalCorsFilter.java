// // GlobalCorsFilter.java
// package com.example.demo.configurations;

// import jakarta.servlet.Filter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.cors.*;
// import org.springframework.web.filter.CorsFilter;
// import org.springframework.boot.web.servlet.FilterRegistrationBean;

// @Configuration
// public class GlobalCorsFilter {

//     @Bean
//     public FilterRegistrationBean<Filter> corsFilter() {
//         CorsConfiguration cfg = new CorsConfiguration();
//         cfg.addAllowedOrigin("http://localhost:5173");
//         cfg.addAllowedHeader("*");
//         cfg.addAllowedMethod("*");
//         cfg.setAllowCredentials(true);

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", cfg);

//         FilterRegistrationBean<Filter> bean =
//                 new FilterRegistrationBean<>(new CorsFilter(source));
//         bean.setOrder(0); // перед Spring Security
//         return bean;
//     }
// }
