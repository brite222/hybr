import pool from "../config/db.js";

// ─── GET /api/content/:weekNumber/:lessonId ─── (students fetch lesson content)
export const getContent = async (req, res) => {
  const { weekNumber, lessonId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM lesson_content WHERE week_number = $1 AND lesson_id = $2`,
      [weekNumber, lessonId]
    );
    
    if (result.rows.length === 0) {
      // Return empty object if no content yet (lesson page uses fallbacks)
      return res.json({ content: null });
    }
    
    res.json({ content: result.rows[0] });
  } catch (err) {
    console.error("getContent error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/admin/content ─── (admin sees ALL content)
export const getAllContent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM lesson_content ORDER BY week_number, lesson_id`
    );
    
    // Group by week
    const byWeek = {};
    result.rows.forEach(row => {
      if (!byWeek[row.week_number]) byWeek[row.week_number] = [];
      byWeek[row.week_number].push(row);
    });
    
    res.json({ content: result.rows, by_week: byWeek });
  } catch (err) {
    console.error("getAllContent error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/admin/content ─── (admin creates or updates content)
export const upsertContent = async (req, res) => {
  const {
    week_number, lesson_id, lesson_type,
    title, subtitle, duration, header, body_text, body_text_2, program_track,
    video_url, audio_url, image_url, pdf_url, image_caption,
    quiz_data, objectives_json, references_json, resources_json, transcript_json,
    survey_url, // ✅ NEW
  } = req.body;

  if (!week_number || !lesson_id || !lesson_type) {
    return res.status(400).json({ message: "week_number, lesson_id, and lesson_type required" });
  }

  try {
    const result = await pool.query(`
      INSERT INTO lesson_content (
        week_number, lesson_id, lesson_type,
        title, subtitle, duration, header, body_text, body_text_2, program_track,
        video_url, audio_url, image_url, pdf_url, image_caption,
        quiz_data, objectives_json, references_json, resources_json, transcript_json,
        survey_url,
        updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      )
      ON CONFLICT (week_number, lesson_id) DO UPDATE SET
        lesson_type = EXCLUDED.lesson_type,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        duration = EXCLUDED.duration,
        header = EXCLUDED.header,
        body_text = EXCLUDED.body_text,
        body_text_2 = EXCLUDED.body_text_2,
        program_track = EXCLUDED.program_track,
        video_url = EXCLUDED.video_url,
        audio_url = EXCLUDED.audio_url,
        image_url = EXCLUDED.image_url,
        pdf_url = EXCLUDED.pdf_url,
        image_caption = EXCLUDED.image_caption,
        quiz_data = EXCLUDED.quiz_data,
        objectives_json = EXCLUDED.objectives_json,
        references_json = EXCLUDED.references_json,
        resources_json = EXCLUDED.resources_json,
        transcript_json = EXCLUDED.transcript_json,
        survey_url = EXCLUDED.survey_url,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *
    `, [
      week_number, lesson_id, lesson_type,
      title, subtitle, duration, header, body_text, body_text_2, program_track,
      video_url, audio_url, image_url, pdf_url, image_caption,
      quiz_data ? JSON.stringify(quiz_data) : null,
      objectives_json ? JSON.stringify(objectives_json) : null,
      references_json ? JSON.stringify(references_json) : null,
      resources_json ? JSON.stringify(resources_json) : null,
      transcript_json ? JSON.stringify(transcript_json) : null,
      survey_url || null,
      req.user.id,
    ]);

    res.json({ message: "Content saved", content: result.rows[0] });
  } catch (err) {
    console.error("upsertContent error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /api/admin/content/:weekNumber/:lessonId ───
export const deleteContent = async (req, res) => {
  const { weekNumber, lessonId } = req.params;
  
  try {
    const result = await pool.query(
      `DELETE FROM lesson_content WHERE week_number = $1 AND lesson_id = $2 RETURNING id`,
      [weekNumber, lessonId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    res.json({ message: "Content deleted" });
  } catch (err) {
    console.error("deleteContent error:", err);
    res.status(500).json({ message: err.message });
  }
};