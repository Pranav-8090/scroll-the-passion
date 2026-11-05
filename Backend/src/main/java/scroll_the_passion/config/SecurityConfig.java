
package scroll_the_passion.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Spring Security Configuration
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // CORS Configuration
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()))

            // Disable CSRF for API
            .csrf(csrf -> csrf.disable())

            // Authorization Configuration
            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // Allow Login, Register, Logout APIs
                .requestMatchers(
                    "/api/auth/**",
                    "/error"
                ).permitAll()

                // Other APIs
                .anyRequest().permitAll()
            );

        return http.build();
    }

    // CORS Configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Allowed Frontend Origins
        config.setAllowedOrigins(List.of(

            "http://localhost:5173",

            "http://localhost:3000",

            "https://scroll-the-passion.vercel.app",

            "https://scroll-the-passion-98ey.vercel.app"

        ));

        // Allowed HTTP Methods
        config.setAllowedMethods(List.of(

            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"

        ));

        // Allowed Headers
        config.setAllowedHeaders(List.of("*"));

        // Allow Session Cookies
        config.setAllowCredentials(true);

        // Max Age
        config.setMaxAge(3600L);

        // Register CORS Configuration
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }
}
