package com.afet.assignmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsDto {
    private Long totalHelpRequests;
    private Long activeVolunteers;
    private Long completedTasks;
    private Long safeZones;

    // Explicit builder in case Lombok is not working
    public static AdminStatisticsDtoBuilder builder() {
        return new AdminStatisticsDtoBuilder();
    }

    public static class AdminStatisticsDtoBuilder {
        private Long totalHelpRequests;
        private Long activeVolunteers;
        private Long completedTasks;
        private Long safeZones;

        public AdminStatisticsDtoBuilder totalHelpRequests(Long totalHelpRequests) {
            this.totalHelpRequests = totalHelpRequests;
            return this;
        }

        public AdminStatisticsDtoBuilder activeVolunteers(Long activeVolunteers) {
            this.activeVolunteers = activeVolunteers;
            return this;
        }

        public AdminStatisticsDtoBuilder completedTasks(Long completedTasks) {
            this.completedTasks = completedTasks;
            return this;
        }

        public AdminStatisticsDtoBuilder safeZones(Long safeZones) {
            this.safeZones = safeZones;
            return this;
        }

        public AdminStatisticsDto build() {
            return new AdminStatisticsDto(totalHelpRequests, activeVolunteers, completedTasks, safeZones);
        }
    }
}
