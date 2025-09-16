package com.afet.informationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAnnouncementDto {

    @NotBlank(message = "Başlık boş olamaz.")
    @Size(max = 255, message = "Başlık en fazla 255 karakter olabilir.")
    private String title;

    @NotBlank(message = "İçerik boş olamaz.")
    private String content;

}