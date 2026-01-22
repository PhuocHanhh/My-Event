package com.be_event.my_event_platform.configuration;

import com.example.myevent_be.entity.Role;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.repository.RoleRepository;
import com.example.myevent_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;


@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@CrossOrigin("http://localhost:3000")
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnMissingBean(ApplicationRunner.class)
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository){
        return args -> {
            if (userRepository.findByEmail("admin123@gmail.com").isEmpty()) {
                Role adminRole = roleRepository.findByName("ADMIN")
                        .orElseGet(() -> {
                            // Tạo vai trò ADMIN nếu chưa tồn tại
                            Role newRole = new Role();
                            newRole.setName("ADMIN");
                            return roleRepository.save(newRole);
                        });

                Role supplierRole = roleRepository.findByName("SUPPLIER")
                        .orElseGet(() -> {
                            log.info("Role SUPPLIER chưa tồn tại, tiến hành tạo mới...");
                            Role newRole = new Role();
                            newRole.setName("SUPPLIER");
                            return roleRepository.save(newRole);
                        });

                Role managerRole = roleRepository.findByName("MANAGER")
                        .orElseGet(() -> {
                            log.info("Role MANAGER chưa tồn tại, tiến hành tạo mới...");
                            Role newRole = new Role();
                            newRole.setName("MANAGER");
                            return roleRepository.save(newRole);
                        });

                User user = User.builder()
                        .first_name("admin")
                        .last_name("admin")
                        .email("admin123@gmail.com")
                        .phoneNumber("0123456789")
                        .password(passwordEncoder.encode("admin"))
                        .role(adminRole)
                        .build();

                userRepository.save(user);

                log.warn("Admin user has been created with password: admin, please change it");
            }
        };
    }
}
