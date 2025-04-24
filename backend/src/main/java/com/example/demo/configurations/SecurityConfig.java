package com.example.demo.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;               // ← импорт
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())      // CORS‑заголовки
            .csrf(csrf -> csrf.disable())         // отключаем CSRF для REST
            .authorizeHttpRequests(auth -> auth   // ⬇︎ разрешаем публичные URL
                    .requestMatchers(
                            "/api/auth/**",       // регистрация / login
                            "/ws/**",             // SockJS /ws/info
                            "/uploads/**"         // картинки, если нужны
                    ).permitAll()
                    .anyRequest().authenticated()
            );
        return http.build();
    }
}
