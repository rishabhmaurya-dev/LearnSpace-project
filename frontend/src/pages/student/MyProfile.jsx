import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchStudentProfile,
  updateStudentProfile,
} from "../../features/student/studentProfileThunks";
import {
  clearStudentProfileError,
  clearStudentProfileSuccess,
} from "../../features/student/studentProfileSlice";

import styles from "./MyProfile.module.css";

const EMPTY_FORM = {
  bio: "",
  githubProfile: "",
  linkedinProfile: "",
};

const MyProfile = () => {
  const dispatch = useDispatch();

  const { profile, loading, updating, error, success, message } = useSelector(
    (state) => state.studentProfile,
  );
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState(EMPTY_FORM);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState(null);

  const hasCompletedProfile = Boolean(
    profile?.bio?.trim() ||
    profile?.githubProfile?.trim() ||
    profile?.linkedinProfile?.trim() ||
    profile?.avatar,
  );

  if (profile !== syncedProfile) {
    setSyncedProfile(profile);
    setForm({
      bio: profile?.bio || "",
      githubProfile: profile?.githubProfile || "",
      linkedinProfile: profile?.linkedinProfile || "",
    });
    setAvatarPreview(profile?.avatar || "");
    setAvatar(null);
    setIsEditing(profile ? !hasCompletedProfile : false);
  }

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!success) return;
    toast.success(message || "Profile updated successfully", {
      duration: 2500,
    });
    const timer = setTimeout(() => {
      dispatch(clearStudentProfileSuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  useEffect(() => {
    if (!error) return;
    toast.error(error || "An error occurred", { duration: 3500 });
    const timer = setTimeout(() => {
      dispatch(clearStudentProfileError());
    }, 3500);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    if (form.bio.trim()) fd.append("bio", form.bio.trim());
    if (form.githubProfile.trim())
      fd.append("githubProfile", form.githubProfile.trim());
    if (form.linkedinProfile.trim())
      fd.append("linkedinProfile", form.linkedinProfile.trim());
    if (avatar) fd.append("avatar", avatar);
    dispatch(updateStudentProfile(fd));
  };

  const handleCancel = () => {
    setForm({
      bio: profile?.bio || "",
      githubProfile: profile?.githubProfile || "",
      linkedinProfile: profile?.linkedinProfile || "",
    });
    setAvatarPreview(profile?.avatar || "");
    setAvatar(null);
    setIsEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className={styles.profileState}>
        <div className={styles.loadingSpinner} />
        <span>Loading your profile...</span>
      </div>
    );
  }

  const skills = profile?.verifiedSkills || [];
  const initial = user?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className={styles.profilePage}>
      {/* ================= HERO PROFILE BANNER CARD ================= */}
      <div className={styles.heroCard}>
        <br />

        <div className={styles.heroBody}>
          <div className={styles.avatarWrap}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Student avatar"
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatarFallback}>{initial}</div>
            )}
          </div>

          <div className={styles.heroMain}>
            <div className={styles.heroInfo}>
              <h1>{user?.name || "Student"}</h1>
              <p>{user?.email}</p>
              <span className={styles.roleBadge}>🎓 Verified Learner</span>
            </div>

            <div className={styles.heroActions}>
              {hasCompletedProfile &&
                (isEditing ? (
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                  >
                    ✕ Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN GRID ================= */}
      <div className={styles.profileLayout}>
        {/* LEFT COLUMN: Stats & Skills */}
        <aside className={styles.sidebarColumn}>
          {/* Quick Metrics */}
          <div className={styles.panelCard}>
            <h3>Learning Overview</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>🏆</div>
                <div className={styles.statDetails}>
                  <strong>{profile?.reputationPoints || 0}</strong>
                  <span>Reputation Points</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>📚</div>
                <div className={styles.statDetails}>
                  <strong>{profile?.completedCoursesCount || 0}</strong>
                  <span>Completed Courses</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statDetails}>
                  <strong>{profile?.completedProjectsCount || 0}</strong>
                  <span>Approved Projects</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Skills */}
          <div className={styles.panelCard}>
            <h3>Verified Skills</h3>
            {skills.length === 0 ? (
              <p className={styles.emptyNote}>
                Complete courses & quizzes to earn verified skills.
              </p>
            ) : (
              <div className={styles.skillTags}>
                {skills.map((skill) => (
                  <span className={styles.skillTag} key={skill}>
                    <span>✓</span> {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Details / Edit Form */}
        <main className={styles.contentColumn}>
          {!isEditing ? (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>About & Social Presence</h2>
                <p>Public details visible to mentors and instructors</p>
              </div>

              {/* Bio */}
              <div className={styles.infoGroup}>
                <label>Biography</label>
                {profile?.bio?.trim() ? (
                  <p className={styles.bioText}>{profile.bio}</p>
                ) : (
                  <div className={styles.emptyPrompt}>
                    <span>📝</span> No bio added yet. Tell mentors about your
                    skills & interests.
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className={styles.infoGroup}>
                <label>Connected Profiles</label>
                <div className={styles.socialGrid}>
                  <div className={styles.socialCard}>
                    <div className={styles.socialHead}>
                      <span className={styles.socialIcon}>🐙</span>
                      <strong>GitHub</strong>
                    </div>
                    {profile?.githubProfile?.trim() ? (
                      <a
                        href={profile.githubProfile}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {profile.githubProfile.replace(/^https?:\/\//, "")} ↗
                      </a>
                    ) : (
                      <span className={styles.unlinked}>Not connected</span>
                    )}
                  </div>

                  <div className={styles.socialCard}>
                    <div className={styles.socialHead}>
                      <span className={styles.socialIcon}>💼</span>
                      <strong>LinkedIn</strong>
                    </div>
                    {profile?.linkedinProfile?.trim() ? (
                      <a
                        href={profile.linkedinProfile}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {profile.linkedinProfile.replace(/^https?:\/\//, "")} ↗
                      </a>
                    ) : (
                      <span className={styles.unlinked}>Not connected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Edit Profile Information</h2>
                <p>Update your public profile, links, and avatar image</p>
              </div>

              <div className={styles.formSection}>
                <label htmlFor="avatar">Profile Picture</label>
                <div className={styles.fileUploader}>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatar}
                    className={styles.fileInput}
                  />
                  {avatarPreview && (
                    <span className={styles.fileNote}>
                      {avatar
                        ? `Selected: ${avatar.name}`
                        : "Current photo uploaded"}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formSection}>
                <label htmlFor="bio">About Me</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className={styles.textInput}
                  placeholder="Share a short bio, goals, or what you are currently learning..."
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formSection}>
                  <label htmlFor="githubProfile">GitHub Profile URL</label>
                  <input
                    id="githubProfile"
                    name="githubProfile"
                    type="url"
                    className={styles.textInput}
                    placeholder="https://github.com/username"
                    value={form.githubProfile}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formSection}>
                  <label htmlFor="linkedinProfile">LinkedIn Profile URL</label>
                  <input
                    id="linkedinProfile"
                    name="linkedinProfile"
                    type="url"
                    className={styles.textInput}
                    placeholder="https://linkedin.com/in/username"
                    value={form.linkedinProfile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={updating}
                >
                  {updating ? "Saving Changes..." : "Save Profile"}
                </button>
                {hasCompletedProfile && (
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyProfile;
