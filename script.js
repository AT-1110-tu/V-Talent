
/* =========================================
   V-TALENT — FULL SCRIPT
   Supabase + Auth + Needs + Student Profile
   + Applications + Business Needs
========================================= */

const SUPABASE_URL = "https://peonwgtejilfwceckbqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_tHn2LFykKVEUtzY8Kukwvw_M_koy24p";

/* Khai báo tất cả state trước khi các nút có thể gọi hàm */
let supabaseClient = null;
let currentUser = null;
let currentProfile = null;
let liveNeeds = [];
let activeCategory = "all";
let toastTimeout = null;
let authMode = "login";
let pendingAction = null;
let vTalentInitialized = false;


/* =========================================
   LOAD SUPABASE LIBRARY
========================================= */

function loadSupabaseLibrary() {
    if (window.supabase?.createClient) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector(
            'script[data-vtalent-supabase="true"]'
        );

        if (existing) {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.dataset.vtalentSupabase = "true";

        script.onload = () => {
            if (window.supabase?.createClient) {
                resolve();
            } else {
                reject(new Error("Thư viện Supabase tải không thành công."));
            }
        };

        script.onerror = () => reject(
            new Error(
                "Không tải được thư viện Supabase. Hãy kiểm tra kết nối mạng."
            )
        );

        document.head.appendChild(script);
    });
}


/* =========================================
   DEMO DATA
========================================= */

const demoNeeds = [
    {
        id: "demo-1",
        title: "Xây dựng nội dung truyền thông cho sản phẩm",
        category: "Truyền thông",
        description:
            "Hỗ trợ xây dựng nội dung giới thiệu sản phẩm, bài đăng mạng xã hội và cách truyền tải thông tin đến khách hàng.",
        duration: "2–3 tuần",
        business: "SpiDana",
        isDemo: true
    },
    {
        id: "demo-2",
        title: "Hỗ trợ bán hàng trên nền tảng số",
        category: "Kinh doanh số hóa",
        description:
            "Hỗ trợ xây dựng nội dung bán hàng online, cải thiện cách giới thiệu sản phẩm và tiếp cận khách hàng.",
        duration: "3–4 tuần",
        business: "Hộ kinh doanh địa phương",
        isDemo: true
    },
    {
        id: "demo-3",
        title: "Sắp xếp quy trình quản lý đơn hàng",
        category: "Vận hành",
        description:
            "Hỗ trợ theo dõi đơn hàng, quản lý thông tin khách hàng và đơn giản hóa công việc vận hành.",
        duration: "2 tuần",
        business: "Cơ sở sản xuất nhỏ",
        isDemo: true
    }
];


/* =========================================
   HELPERS
========================================= */

const $ = id => document.getElementById(id);

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message) {
    const toast = $("toast");

    if (!toast) {
        console.log("[V-Talent]", message);
        return;
    }

    // Hỗ trợ cả HTML toast có một phần tử thông báo riêng.
    const messageElement = $("toastMessage");

    if (messageElement && toast.contains(messageElement)) {
        messageElement.textContent = message;
    } else {
        toast.textContent = message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

function openModal(id) {
    const modal = $(id);

    if (!modal) {
        console.error(`V-Talent: Không tìm thấy modal có ID "${id}".`);
        showToast(`Không tìm thấy cửa sổ ${id}. Hãy kiểm tra index.html.`);
        return false;
    }

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    return true;
}

function closeModal(id) {
    if (id) {
        $(id)?.classList.remove("show");
    } else {
        // Tương thích với HTML cũ dùng onclick="closeModal()".
        const modal = document.querySelector(".modal.show");
        modal?.classList.remove("show");
    }

    if (!document.querySelector(".modal.show")) {
        document.body.style.overflow = "";
    }
}

function getCheckedValues(name) {
    return Array.from(
        document.querySelectorAll(`input[name="${name}"]:checked`)
    )
        .map(input => input.value)
        .filter(value => value !== "Khác");
}

function resetCheckboxes(name) {
    document.querySelectorAll(`input[name="${name}"]`)
        .forEach(input => {
            input.checked = false;
        });
}

function toggleOther(inputId, checkbox) {
    const input = $(inputId);
    if (!input) return;

    input.classList.toggle("hidden", !checkbox.checked);

    if (!checkbox.checked) input.value = "";
}


/* =========================================
   AUTH UI
========================================= */

function addAccountUI() {
    const nav = document.querySelector(".nav");

    if (!nav || $("accountActions")) return;

    const actions = document.createElement("div");
    actions.id = "accountActions";
    actions.style.cssText =
        "display:flex;align-items:center;gap:8px;flex-wrap:wrap";

    actions.innerHTML = `
        <button class="btn" id="accountButton" type="button">
            Đăng nhập
        </button>
        <button class="btn" id="logoutButton" type="button"
            style="display:none">
            Đăng xuất
        </button>
    `;

    nav.appendChild(actions);

    $("accountButton").addEventListener("click", openAuthModal);
    $("logoutButton").addEventListener("click", signOut);
}

function addAuthModal() {
    if ($("authModal")) return;

    const modal = document.createElement("div");
    modal.id = "authModal";
    modal.className = "modal";

    modal.innerHTML = `
        <div class="modal-box">
            <button class="modal-close" type="button"
                id="authCloseButton">×</button>

            <span class="modal-label green-text">V-TALENT</span>
            <h2 id="authHeading">Đăng nhập</h2>

            <p class="modal-description" id="authDescription">
                Đăng nhập để sử dụng các chức năng của V-Talent.
            </p>

            <form id="authForm">
                <div class="form-group" id="authNameGroup"
                    style="display:none">
                    <label for="authName">Họ và tên</label>
                    <input id="authName" type="text"
                        autocomplete="name">
                </div>

                <div class="form-group" id="authBusinessGroup"
                    style="display:none">
                    <label for="authBusinessName">
                        Tên hộ kinh doanh / đơn vị
                    </label>
                    <input id="authBusinessName" type="text">
                </div>

                <div class="form-group">
                    <label for="authEmail">Email</label>
                    <input id="authEmail" type="email"
                        autocomplete="email" required>
                </div>

                <div class="form-group">
                    <label for="authPassword">Mật khẩu</label>
                    <input id="authPassword" type="password"
                        autocomplete="current-password"
                        minlength="6" required>
                </div>

                <div class="form-group" id="authRoleGroup"
                    style="display:none">
                    <label for="authRole">Loại tài khoản</label>
                    <select id="authRole" class="form-control">
                        <option value="student">Sinh viên</option>
                        <option value="business">Hộ kinh doanh</option>
                    </select>
                </div>

                <button class="btn btn-green full-btn"
                    id="authSubmit" type="submit">
                    Đăng nhập
                </button>
            </form>

            <p style="margin-top:16px;text-align:center">
                <button id="authSwitch" type="button"
                    class="need-view">
                    Chưa có tài khoản? Đăng ký
                </button>
            </p>
        </div>
    `;

    document.body.appendChild(modal);

    $("authCloseButton").addEventListener("click", () => {
        closeModal("authModal");
    });

    $("authForm").addEventListener("submit", handleAuthSubmit);

    $("authSwitch").addEventListener("click", () => {
        authMode = authMode === "login" ? "signup" : "login";
        updateAuthModal();
    });

    $("authRole").addEventListener("change", updateAuthModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal("authModal");
    });
}

function openAuthModal() {
    authMode = "login";
    updateAuthModal();
    openModal("authModal");
}

function updateAuthModal() {
    if (!$("authHeading")) return;

    const signup = authMode === "signup";
    const isBusiness = $("authRole").value === "business";

    $("authHeading").textContent =
        signup ? "Tạo tài khoản" : "Đăng nhập";

    $("authDescription").textContent = signup
        ? "Tạo tài khoản để bắt đầu sử dụng V-Talent."
        : "Đăng nhập để sử dụng các chức năng của V-Talent.";

    $("authNameGroup").style.display = signup ? "" : "none";
    $("authRoleGroup").style.display = signup ? "" : "none";
    $("authBusinessGroup").style.display =
        signup && isBusiness ? "" : "none";

    $("authName").required = signup;
    $("authBusinessName").required = signup && isBusiness;

    $("authPassword").autocomplete =
        signup ? "new-password" : "current-password";

    $("authSubmit").textContent = signup ? "Đăng ký" : "Đăng nhập";

    $("authSwitch").textContent = signup
        ? "Đã có tài khoản? Đăng nhập"
        : "Chưa có tài khoản? Đăng ký";
}

async function handleAuthSubmit(event) {
    event.preventDefault();

    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    const button = $("authSubmit");

    button.disabled = true;

    try {
        if (authMode === "signup") {
            const role = $("authRole").value;
            const fullName = $("authName").value.trim();
            const businessName = $("authBusinessName").value.trim();

            if (!fullName) {
                throw new Error("Vui lòng nhập họ và tên.");
            }

            if (role === "business" && !businessName) {
                throw new Error("Vui lòng nhập tên hộ kinh doanh.");
            }

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role,
                        full_name: fullName,
                        business_name: role === "business"
                            ? businessName
                            : ""
                    }
                }
            });

            if (error) throw error;

            if (!data.session) {
                closeModal("authModal");
                showToast(
                    "Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản."
                );
                return;
            }

            currentUser = data.user;
            await loadCurrentProfile();

            updateAccountUI();
            closeModal("authModal");
            await refreshNeeds();

            showToast("Tạo tài khoản thành công!");
            await runPendingAction();
        } else {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            currentUser = data.user;
            await loadCurrentProfile();

            updateAccountUI();
            closeModal("authModal");
            await refreshNeeds();

            showToast("Đăng nhập thành công!");
            await runPendingAction();
        }
    } catch (error) {
        console.error("Auth error:", error);
        showToast(error.message || "Không thể xử lý tài khoản.");
    } finally {
        button.disabled = false;
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        currentUser = null;
        currentProfile = null;

        updateAccountUI();
        await refreshNeeds();

        showToast("Đã đăng xuất.");
    } catch (error) {
        console.error("Sign out error:", error);
        showToast(error.message || "Không thể đăng xuất.");
    }
}

function updateAccountUI() {
    const loginButton = $("accountButton");
    const logoutButton = $("logoutButton");

    if (!loginButton || !logoutButton) return;

    loginButton.textContent = currentUser
        ? (currentProfile?.full_name || "Tài khoản")
        : "Đăng nhập";

    logoutButton.style.display = currentUser ? "" : "none";
}

async function loadCurrentProfile() {
    if (!currentUser) {
        currentProfile = null;
        return;
    }

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, role, full_name, phone, email")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) throw error;

    currentProfile = data;
}

function requireRole(role, actionName = null) {
    if (!currentUser) {
        pendingAction = actionName;
        showToast("Vui lòng đăng nhập để tiếp tục.");
        openAuthModal();
        return false;
    }

    if (!currentProfile || currentProfile.role !== role) {
        showToast(
            role === "student"
                ? "Chức năng này dành cho tài khoản sinh viên."
                : "Chức năng này dành cho tài khoản hộ kinh doanh."
        );
        return false;
    }

    return true;
}

async function runPendingAction() {
    const action = pendingAction;
    pendingAction = null;

    if (action === "student") await openStudentModal();
    if (action === "business") openBusinessModal();
}


/* =========================================
   NEEDS
========================================= */

async function refreshNeeds() {
    try {
        const { data, error } = await supabaseClient
            .from("needs")
            .select(
                "id, title, category, description, duration, status, business_id"
            )
            .eq("status", "open")
            .order("created_at", { ascending: false });

        if (error) throw error;

        liveNeeds = (data || []).map(item => ({
            ...item,
            business: "Hộ kinh doanh",
            isDemo: false
        }));
    } catch (error) {
        console.error("Load needs error:", error);
        liveNeeds = [];
        // Nếu Supabase lỗi, các nhu cầu demo vẫn được hiển thị.
    }

    renderNeeds(activeCategory);
}

function renderNeeds(category = "all") {
    const list = $("needsList");
    if (!list) return;

    activeCategory = category;

    const allNeeds = [...liveNeeds, ...demoNeeds];

    const filtered = category === "all"
        ? allNeeds
        : allNeeds.filter(item => item.category === category);

    list.innerHTML = "";

    if (!filtered.length) {
        list.innerHTML = `
            <div class="empty-state">
                Hiện chưa có nhu cầu phù hợp.
            </div>`;
        return;
    }

    filtered.forEach(need => {
        const card = document.createElement("div");
        card.className = "need-card";

        card.innerHTML = `
            <span class="need-category">
                ${escapeHTML(need.category)}
            </span>
            <h3>${escapeHTML(need.title)}</h3>
            <p>${escapeHTML(need.description)}</p>
            <div class="need-footer">
                <span class="need-duration">
                    ${escapeHTML(need.duration || "Chưa cập nhật")}
                </span>
                <button class="need-view" type="button">
                    Xem chi tiết →
                </button>
            </div>`;

        card.querySelector("button").addEventListener("click", () => {
            openNeedModal(need.id);
        });

        list.appendChild(card);
    });
}

function filterNeeds(category, button) {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) button.classList.add("active");

    renderNeeds(category);
}


/* =========================================
   MODALS
========================================= */

function openBusinessModal() {
    if (!requireRole("business", "business")) return;
    openModal("businessModal");
}

async function openStudentModal() {
    if (!requireRole("student", "student")) return;

    await loadStudentProfile();
    openModal("studentModal");
}


function openNeedModal(id) {
    const need = [...liveNeeds, ...demoNeeds].find(
        item => String(item.id) === String(id)
    );

    if (!need) {
        showToast("Không tìm thấy nhu cầu này.");
        return;
    }

    $("needCategory").textContent = need.category || "";
    $("needTitle").textContent = need.title || "";
    $("needDescription").textContent = need.description || "";
    $("needDuration").textContent =
        need.duration || "Chưa cập nhật";

    const applyButton = $("applyButton");

    if (applyButton) {
        applyButton.onclick = () => {
            closeModal("needModal");

            // Nhu cầu demo chưa có ID thật trong Supabase.
            if (need.isDemo || !Number.isFinite(Number(need.id))) {
                showToast(
                    "Đây là nhu cầu minh họa, chưa thể gửi đề xuất thật."
                );
                return;
            }

            openApplicationModal(need.id);
        };
    }

    openModal("needModal");
}

function openApplicationModal(needId) {
    if (!requireRole("student")) return;

    if ($("applicationNeedId")) {
        $("applicationNeedId").value = needId;
    }

    openModal("applicationModal");
}


/* =========================================
   BUTTON BINDING
========================================= */

function bindMainButtons() {
    // Các nút có onclick trong HTML sẽ gọi các hàm global.
    // Không tự gắn sự kiện theo nội dung nút để tránh gắn trùng.
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal(modal.id);
        });
    });
}


/* =========================================
   STUDENT PROFILE
========================================= */

async function loadStudentProfile() {
    if (!currentUser) return;

    try {
        const { data: profile, error } = await supabaseClient
            .from("profiles")
            .select("full_name, phone, email")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (error) throw error;

        const { data: student, error: studentError } =
            await supabaseClient
                .from("student_profiles")
                .select("university, introduction, specialties, skills")
                .eq("user_id", currentUser.id)
                .maybeSingle();

        if (studentError) throw studentError;

        if ($("studentName")) {
            $("studentName").value = profile?.full_name || "";
        }

        if ($("studentSchool")) {
            $("studentSchool").value = student?.university || "";
        }

        if ($("studentPhone")) {
            $("studentPhone").value = profile?.phone || "";
        }

        if ($("studentEmail")) {
            $("studentEmail").value =
                profile?.email || currentUser.email || "";
        }

        if ($("studentIntro")) {
            $("studentIntro").value = student?.introduction || "";
        }

        resetCheckboxes("competency");
        resetCheckboxes("skill");

        (student?.specialties || []).forEach(value => {
            const box = [...document.querySelectorAll(
                'input[name="competency"]'
            )].find(input => input.value === value);

            if (box) box.checked = true;
        });

        (student?.skills || []).forEach(value => {
            const box = [...document.querySelectorAll(
                'input[name="skill"]'
            )].find(input => input.value === value);

            if (box) box.checked = true;
        });
    } catch (error) {
        console.error("Load student profile error:", error);
        showToast("Chưa tải được hồ sơ sinh viên.");
    }
}

if ($("studentForm")) {
    $("studentForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!requireRole("student")) return;

        try {
            const specialties = getCheckedValues("competency");
            const skills = getCheckedValues("skill");

            const competencyOther =
                $("competencyOther")?.value.trim() || "";

            const skillOther =
                $("skillOther")?.value.trim() || "";

            const competencyOtherChecked = document.querySelector(
                'input[name="competency"][value="Khác"]'
            )?.checked;

            const skillOtherChecked = document.querySelector(
                'input[name="skill"][value="Khác"]'
            )?.checked;

            if (competencyOtherChecked && competencyOther) {
                specialties.push(competencyOther);
            }

            if (skillOtherChecked && skillOther) {
                skills.push(skillOther);
            }

            const fullName = $("studentName")?.value.trim() || "";
            const phone = $("studentPhone")?.value.trim() || "";
            const email = $("studentEmail")?.value.trim() || "";

            const { error: profileError } = await supabaseClient
                .from("profiles")
                .update({ full_name: fullName, phone, email })
                .eq("id", currentUser.id);

            if (profileError) throw profileError;

            const { error: studentError } = await supabaseClient
                .from("student_profiles")
                .upsert({
                    user_id: currentUser.id,
                    university: $("studentSchool")?.value.trim() || "",
                    introduction: $("studentIntro")?.value.trim() || "",
                    specialties,
                    skills
                });

            if (studentError) throw studentError;

            await loadCurrentProfile();
            updateAccountUI();
            closeModal("studentModal");
            showToast("Đã lưu hồ sơ lên hệ thống.");
        } catch (error) {
            console.error("Save student profile error:", error);
            showToast(error.message || "Không lưu được hồ sơ.");
        }
    });
}


/* =========================================
   APPLICATIONS
========================================= */

if ($("applicationForm")) {
    $("applicationForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!requireRole("student")) return;

        try {
            const needId = Number($("applicationNeedId")?.value);
            const support = $("applicationSupport")?.value.trim() || "";
            const fit = $("applicationFit")?.value.trim() || "";
            const result = $("applicationResult")?.value.trim() || "";

            if (!needId) {
                throw new Error("Không xác định được nhu cầu ứng tuyển.");
            }

            const { error } = await supabaseClient
                .from("applications")
                .insert({
                    need_id: needId,
                    student_id: currentUser.id,
                    support_plan: support,
                    suitability: fit,
                    expected_result: result
                });

            if (error) {
                if (error.code === "23505") {
                    throw new Error(
                        "Bạn đã gửi đề xuất cho nhu cầu này rồi."
                    );
                }
                throw error;
            }

            this.reset();
            closeModal("applicationModal");
            showToast("Đã gửi đề xuất lên hệ thống.");
        } catch (error) {
            console.error("Application error:", error);
            showToast(error.message || "Không gửi được đề xuất.");
        }
    });
}


/* =========================================
   BUSINESS PROFILE & NEED
========================================= */

if ($("businessForm")) {
    $("businessForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!requireRole("business")) return;

        try {
            const categories = getCheckedValues("businessNeed");
            const other = $("businessNeedOther")?.value.trim() || "";

            const otherChecked = document.querySelector(
                'input[name="businessNeed"][value="Khác"]'
            )?.checked;

            if (otherChecked && other) categories.push(other);

            if (!categories.length) {
                showToast("Hãy chọn ít nhất một nhu cầu hỗ trợ.");
                return;
            }

            const businessName = $("businessName")?.value.trim() || "";
            const phone = $("businessPhone")?.value.trim() || "";
            const address = $("businessAddress")?.value.trim() || "";
            const field = $("businessField")?.value.trim() || "";
            const product = $("businessProduct")?.value.trim() || "";
            const description =
                $("businessDescription")?.value.trim() || "";
            const people = Number($("businessPeople")?.value || 1);
            const duration = $("businessDuration")?.value.trim() || "";

            if (!businessName || !description) {
                showToast("Vui lòng nhập tên đơn vị và mô tả nhu cầu.");
                return;
            }

            const { data: business, error: businessError } =
                await supabaseClient
                    .from("business_profiles")
                    .select("verification_status")
                    .eq("user_id", currentUser.id)
                    .maybeSingle();

            if (businessError) throw businessError;

            if (
                !business ||
                business.verification_status !== "verified"
            ) {
                showToast(
                    "Tài khoản hộ kinh doanh đang chờ xác minh nên chưa thể đăng nhu cầu."
                );
                return;
            }

            const { error: profileError } = await supabaseClient
                .from("profiles")
                .update({ phone })
                .eq("id", currentUser.id);

            if (profileError) throw profileError;

            const { error: businessUpdateError } = await supabaseClient
                .from("business_profiles")
                .update({
                    business_name: businessName,
                    address,
                    field,
                    main_products: product
                })
                .eq("user_id", currentUser.id);

            if (businessUpdateError) throw businessUpdateError;

            const { error: needError } = await supabaseClient
                .from("needs")
                .insert({
                    business_id: currentUser.id,
                    title: `Hỗ trợ ${categories.join(", ")} cho ${businessName}`,
                    category: categories[0],
                    description,
                    duration,
                    people_needed: people
                });

            if (needError) throw needError;

            this.reset();
            $("businessNeedOther")?.classList.add("hidden");

            closeModal("businessModal");
            await refreshNeeds();
            showToast("Đã đăng nhu cầu lên hệ thống.");
        } catch (error) {
            console.error("Business form error:", error);
            showToast(error.message || "Không đăng được nhu cầu.");
        }
    });
}


/* =========================================
   GLOBAL FUNCTIONS FOR HTML onclick
========================================= */

window.openModal = openModal;
window.closeModal = closeModal;
window.openAuthModal = openAuthModal;
window.openStudentModal = openStudentModal;
window.openBusinessModal = openBusinessModal;
window.openNeedModal = openNeedModal;
window.openApplicationModal = openApplicationModal;
window.filterNeeds = filterNeeds;
window.toggleOther = toggleOther;


/* =========================================
   INITIALIZATION
========================================= */

async function initVTalent() {
    if (vTalentInitialized) return;
    vTalentInitialized = true;

    try {
        await loadSupabaseLibrary();

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

        addAccountUI();
        addAuthModal();
        bindMainButtons();

        const { data, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        currentUser = data?.session?.user || null;

        if (currentUser) {
            try {
                await loadCurrentProfile();
            } catch (error) {
                console.error("Load profile error:", error);
                showToast("Không tải được hồ sơ tài khoản.");
            }
        }

        updateAccountUI();
        await refreshNeeds();

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            currentUser = session?.user || null;

            setTimeout(async () => {
                try {
                    await loadCurrentProfile();
                    updateAccountUI();
                    await refreshNeeds();
                } catch (error) {
                    console.error("Auth state error:", error);
                }
            }, 0);
        });

        console.log("V-Talent đã khởi chạy.");
    } catch (error) {
        vTalentInitialized = false;
        console.error("V-Talent initialization error:", error);
        showToast(
            error.message ||
            "Không thể khởi động V-Talent. Hãy kiểm tra kết nối mạng."
        );
    }
}

initVTalent();
