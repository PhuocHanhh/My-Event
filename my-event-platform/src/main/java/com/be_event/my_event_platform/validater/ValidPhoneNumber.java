package com.be_event.my_event_platform.validater;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber { // khai bao anotation moi
    String message() default "Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
