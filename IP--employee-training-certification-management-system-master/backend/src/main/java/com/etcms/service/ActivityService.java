package com.etcms.service;

import com.etcms.model.ActivityLog;
import com.etcms.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public ActivityLog logActivity(String action, String user) {
        ActivityLog log = new ActivityLog();
        log.setAction(action);
        log.setUser(user != null ? user : "System");
        log.setDate(LocalDateTime.now());
        return activityLogRepository.save(log);
    }
}
