package com.email.writer.Service;

import com.email.writer.Entity.EmailRequest;
import com.email.writer.Entity.ModifyEmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String GEMINI_URL;
    @Value("${gemini.api.key}")
    private String GEMINI_KEY;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest){
        String prompt = buildPrompt(emailRequest);
        String response = getAiResponse(prompt);
        return response;
    }

    private String getAiResponse(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        String response = webClient.post()
                .uri(GEMINI_URL + GEMINI_KEY)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        }catch (Exception e){
            return e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Reply to following email query with a subject and no extra explanation");
        prompt.append("Here's some reply specification, ignore if empty");
        prompt.append("\nTone : ").append(emailRequest.getTone());
        prompt.append("\nIntent : ").append(emailRequest.getIntent());
        prompt.append("\nLines : ").append(emailRequest.getLength());
        prompt.append("\nFormat : ").append(emailRequest.getFormat());
        prompt.append("\nLanguage : ").append(emailRequest.getLanguage());
        prompt.append("\nCustom Keywords : ").append(emailRequest.getCustomKeywords());
        prompt.append("\nOriginal email : ").append(emailRequest.getEmailContent());

        return prompt.toString();
    }

    public String modifyReply(ModifyEmailRequest modifyEmailRequest) {
        String prompt = "Perform the specified action on following email without changing meaning. Return without any extra text or explanation\n" +
        "Action : " + modifyEmailRequest.getModification() + "\n" +
        "Email Reply : " + modifyEmailRequest.getGeneratedReply();
        return getAiResponse(prompt);
    }
}
