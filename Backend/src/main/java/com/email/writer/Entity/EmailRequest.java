package com.email.writer.Entity;


public class EmailRequest {
    private String emailContent;
    private String tone;
    private String length;
    private String intent;
    private String format;
    private String customKeywords;

    public String getCustomKeywords() {
        return customKeywords;
    }

    public void setCustomKeywords(String customKeywords) {
        this.customKeywords = customKeywords;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getLength() {
        return length;
    }

    public void setLength(String length) {
        this.length = length;
    }

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
