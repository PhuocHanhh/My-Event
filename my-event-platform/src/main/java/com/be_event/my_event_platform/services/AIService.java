
package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.response.AIResponse;
import com.example.myevent_be.dto.response.EventResponse;
import com.example.myevent_be.entity.Event;
import com.example.myevent_be.entity.EventType;
import com.example.myevent_be.repository.EventRepository;
import com.example.myevent_be.repository.EventTypeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AIService {

    @Value("${google.ai.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final EventTypeRepository eventTypeRepository;
    private final EventRepository eventRepository;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
    public AIResponse startConversation() {
        AIResponse response = new AIResponse();
        try {
            List<String> eventTypes = eventTypeRepository.findAll().stream()
                    .map(EventType::getName)
                    .filter(name -> name != null && !name.isBlank())
                    .collect(Collectors.toList());
            response.setEventTypes(eventTypes);
//            response.setMessage("Xin chào! Vui lòng chọn loại sự kiện bạn cần hỗ trợ.");
        } catch (Exception e) {
            log.error("Error fetching event types", e);
            response.setMessage("Có lỗi khi tải danh sách loại sự kiện. Vui lòng thử lại.");
            response.setEventTypes(Collections.emptyList());
        }
        return response;
    }

    public AIResponse generateResponse(String userInput) {
        AIResponse response = new AIResponse();

        if (!eventTypeRepository.findByName(userInput).isPresent()) {
            List<String> eventTypes = eventTypeRepository.findAll().stream()
                    .map(EventType::getName)
                    .collect(Collectors.toList());
            response.setMessage("Loại sự kiện không hợp lệ. Vui lòng chọn: " + String.join(", ", eventTypes));
            response.setEventTypes(eventTypes);
            return response;
        }

        // Gọi Gemini API để sinh câu trả lời tự nhiên
        String aiMessage = callGeminiAPI(userInput);
        response.setMessage(aiMessage);

        // Lấy danh sách sự kiện từ database
        List<Event> events = eventRepository.findByEventType_Name(userInput);
        List<EventResponse> eventDtos = events.stream().map(event -> {
            EventResponse dto = new EventResponse();
            dto.setId(event.getId());
            dto.setDetail(event.getDetail());
            dto.setImg(event.getImg());
            dto.setEventTypeName(event.getEventType().getName());
            dto.setName(event.getName());
            dto.setDescription(event.getDescription());
            return dto;
        }).collect(Collectors.toList());
        response.setEvents(eventDtos);
        return response;
    }

    private String callGeminiAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = GEMINI_URL + "?key=" + apiKey;

            // Cập nhật request body theo định dạng mới của Gemini API
            String requestBody = String.format(
                    "{\"contents\": [{\"parts\": [{\"text\": \"Hãy trả lời tự nhiên: Bạn muốn tổ chức %s như thế nào?\"}]}]}",
                    prompt
            );

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return objectMapper.readTree(response.getBody())
                        .path("candidates")
                        .get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText("Không nhận được phản hồi từ AI.");
            } else {
                log.error("Gemini API error: {}", response.getStatusCode());
                return "Có lỗi khi gọi AI. Vui lòng thử lại. Mã lỗi: " + response.getStatusCode();
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "Có lỗi khi xử lý yêu cầu: " + e.getMessage();
        }
    }
}