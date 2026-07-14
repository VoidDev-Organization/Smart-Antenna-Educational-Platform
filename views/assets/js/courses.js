// Courses Page - Filtering and Rendering
(function () {
  // Sample course data - integrate with backend API
  const coursesData = [
    {
      id: "machine-learning",
      title: "Machine Learning & Neural Networks",
      description: "Master ML fundamentals, neural networks, and deep learning techniques",
      skill: "high",
      duration: "1-10",
      category: "Technology"
    },
    {
      id: "web-dev",
      title: "Full-Stack Web Development",
      description: "Learn frontend and backend development with modern frameworks",
      skill: "medium",
      duration: "1-8",
      category: "Technology"
    },
    {
      id: "prompt-eng",
      title: "Prompt Engineering for AI",
      description: "Master the art of crafting effective prompts for AI models",
      skill: "low",
      duration: "1-7",
      category: "AI"
    },
    {
      id: "cybersecurity",
      title: "Cybersecurity Fundamentals",
      description: "Protect systems and networks from digital attacks",
      skill: "high",
      duration: "1-10",
      category: "Security"
    },
    {
      id: "prompt-eng-2",
      title: "Prompt Engineering for AI (Advanced)",
      description: "Advanced techniques for complex AI interactions",
      skill: "high",
      duration: "1-8",
      category: "AI"
    },
    {
      id: "marketing",
      title: "Digital Marketing Strategy",
      description: "Build comprehensive digital marketing strategies and campaigns",
      skill: "medium",
      duration: "1-8",
      category: "Business"
    },
    {
      id: "agile",
      title: "Agile Project Management",
      description: "Master agile methodologies for efficient project delivery",
      skill: "medium",
      duration: "1-7",
      category: "Business"
    },
    {
      id: "supply-chain",
      title: "Supply Chain Management",
      description: "Optimize supply chain operations and logistics",
      skill: "medium",
      duration: "1-10",
      category: "Business"
    },
    {
      id: "ux-design",
      title: "User Experience (UX) Design",
      description: "Create intuitive and beautiful user experiences",
      skill: "low",
      duration: "1-8",
      category: "Design"
    },
    {
      id: "interior",
      title: "Interior Design Basics",
      description: "Fundamentals of interior design and space planning",
      skill: "low",
      duration: "1-7",
      category: "Design"
    },
    {
      id: "music",
      title: "Music Production in Ableton Live",
      description: "Produce professional music using Ableton Live",
      skill: "medium",
      duration: "1-10",
      category: "Creative"
    },
    {
      id: "behavioral",
      title: "Behavioral Economics",
      description: "Understand human decision-making and economic behavior",
      skill: "low",
      duration: "1-8",
      category: "Social Science"
    },
    {
      id: "psychology",
      title: "Cognitive Psychology",
      description: "Explore how the mind processes information and behavior",
      skill: "low",
      duration: "1-7",
      category: "Social Science"
    }
  ];

  const filterState = {
    selectedCourses: [],
    selectedSkills: [],
    selectedDurations: []
  };

  // Initialize
  function init() {
    setupEventListeners();
    renderCourses(coursesData);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Course category buttons
    document.querySelectorAll(".course-item").forEach((btn) => {
      btn.addEventListener("click", handleCourseFilter);
    });

    // Skill level filters
    document.querySelectorAll(".skill-filter").forEach((checkbox) => {
      checkbox.addEventListener("change", handleSkillFilter);
    });

    // Duration filters
    document.querySelectorAll(".duration-filter").forEach((checkbox) => {
      checkbox.addEventListener("change", handleDurationFilter);
    });
  }

  // Handle course category filter
  function handleCourseFilter(e) {
    const courseId = e.target.dataset.course;
    const isActive = e.target.classList.toggle("is-active");

    if (isActive) {
      filterState.selectedCourses.push(courseId);
    } else {
      filterState.selectedCourses = filterState.selectedCourses.filter(
        (id) => id !== courseId
      );
    }

    applyFilters();
  }

  // Handle skill level filter
  function handleSkillFilter(e) {
    const skill = e.target.value;
    if (e.target.checked) {
      filterState.selectedSkills.push(skill);
    } else {
      filterState.selectedSkills = filterState.selectedSkills.filter(
        (s) => s !== skill
      );
    }

    applyFilters();
  }

  // Handle duration filter
  function handleDurationFilter(e) {
    const duration = e.target.value;
    if (e.target.checked) {
      filterState.selectedDurations.push(duration);
    } else {
      filterState.selectedDurations = filterState.selectedDurations.filter(
        (d) => d !== duration
      );
    }

    applyFilters();
  }

  // Apply all filters
  function applyFilters() {
    let filtered = coursesData;

    // Filter by selected courses (if any selected, show only those)
    if (filterState.selectedCourses.length > 0) {
      filtered = filtered.filter((course) =>
        filterState.selectedCourses.includes(course.id)
      );
    }

    // Filter by skill level (if any selected, show only those)
    if (filterState.selectedSkills.length > 0) {
      filtered = filtered.filter((course) =>
        filterState.selectedSkills.includes(course.skill)
      );
    }

    // Filter by duration (if any selected, show only those)
    if (filterState.selectedDurations.length > 0) {
      filtered = filtered.filter((course) =>
        filterState.selectedDurations.includes(course.duration)
      );
    }

    renderCourses(filtered);
  }

  // Render courses to grid
  function renderCourses(courses) {
    const grid = document.getElementById("coursesGrid");
    grid.innerHTML = "";

    if (courses.length === 0) {
      grid.innerHTML = `
        <div class="courses-empty">
          <div class="courses-empty__icon">📚</div>
          <p class="courses-empty__text">No courses found. Try adjusting your filters.</p>
        </div>
      `;
      return;
    }

    courses.forEach((course) => {
      const card = createCourseCard(course);
      grid.appendChild(card);
    });
  }

  // Create course card element
  function createCourseCard(course) {
    const card = document.createElement("div");
    card.className = "course-card";

    const skillLabel = course.skill.charAt(0).toUpperCase() + course.skill.slice(1);
    const durationLabel = `${course.duration.replace("-", "–")} Hours`;

    card.innerHTML = `
      <div class="course-card__image"></div>
      <div class="course-card__content">
        <h3 class="course-card__title">${course.title}</h3>
        <p class="course-card__description">${course.description}</p>
        <div class="course-card__meta">
          <span class="course-card__badge">${skillLabel}</span>
          <span class="course-card__badge">${durationLabel}</span>
        </div>
        <button class="course-card__cta" data-course-id="${course.id}">
          View Course
        </button>
      </div>
    `;

    // Add click handler to CTA button
    const ctaBtn = card.querySelector(".course-card__cta");
    ctaBtn.addEventListener("click", () => {
      handleCourseClick(course);
    });

    return card;
  }

  // Handle course card click
  function handleCourseClick(course) {
    // Try to navigate to course detail (implement backend route)
    // For now, just show alert
    try {
      window.location.href = `/course/${course.id}`;
    } catch (err) {
      alert(`Selected course: ${course.title}`);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();