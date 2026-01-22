package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Role;
import com.example.myevent_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);

//    @EntityGraph(attributePaths = "role") // Load luôn roles khi lấy user
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(String email);
    List<User> findByRoleIn(Collection<Role> roles);
//    Optional<User> findByName(String useId);

}
