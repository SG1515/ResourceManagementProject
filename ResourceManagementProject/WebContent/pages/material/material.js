document.addEventListener("DOMContentLoaded", function () {
  fetch("newMaterialModal.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("beforeend", data);

      const newCustomRangeweight = document.getElementById(
        "newCustomRangeweight"
      );
      const newCustomNumber = document.getElementById("newCustomNumber");

      newCustomRangeweight.addEventListener("input", function () {
        newUpdateValueFromRange(newCustomRangeweight.value);
      });

      newCustomNumber.addEventListener("input", function () {
        newUpdateValueFromNumber(newCustomNumber.value);
      });
    })
    .catch((error) => console.error("Error loading the modal:", error));
});

function updateValueFromRange(value) {
  document.getElementById("rangeValue").innerText = value;
  document.getElementById("customNumber").value = value;
}

function updateValueFromNumber(value) {
  if (value < 0) value = 0;
  if (value > 100) value = 100;
  document.getElementById("rangeValue").innerText = value;
  document.getElementById("customRangeweight").value = value;
}

function newUpdateValueFromRange(value) {
  document.getElementById("newRangeValue").innerText = value;
  document.getElementById("newCustomNumber").value = value;
}

function newUpdateValueFromNumber(value) {
  if (value < 0) value = 0;
  if (value > 100) value = 100;
  document.getElementById("newRangeValue").innerText = value;
  document.getElementById("newCustomRangeweight").value = value;
}

document.addEventListener("DOMContentLoaded", function () {
  loadMaterialData();
});

let materialArray = [];
let selectedRowIndex = null;

async function loadMaterialData() {
  try {
    const response = await fetch("../../data/material.json");
    const materialData = await response.json();
    materialArray = materialData;
    populateTable(materialArray);
  } catch (error) {
    console.error("Error loading material data:", error);
  }
}

function populateTable(data) {
  const tableBody = document.getElementById("materialTableBody");
  tableBody.innerHTML = "";

  data.forEach((material, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-index", index);
    row.addEventListener("click", () => selectRow(index));

    Object.keys(material).forEach((key) => {
      const cell = document.createElement("td");
      cell.textContent = material[key] !== undefined ? material[key] : "";
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}

function selectRow(index) {
  selectedRowIndex = index;
  const material = materialArray[index];
  document.getElementById("materialNameInput").value =
    material.materialName || "";
  document.getElementById("modelNameInput").value = material.modelName || "";
  document.getElementById("manufacturerInput").value =
    material.manufacturer || "";
  document.getElementById("categorySelectDetail").value =
    material.category || "";
  document.getElementById("unitSelect").value = material.unit || "";
  document.getElementById("customRangeweight").value = material.unitWeight || 0;
  document.getElementById("customNumber").value = material.unitWeight || 0;
  document.getElementById("rangeValue").innerText = material.unitWeight || 0;
  document.getElementById("storageMethodSelect").value =
    material.storageMethod || "";
  document.getElementById("usageInput").value = material.usage || "";
}

function validateUnitWeight(unitWeight, isForm = false) {
  if (unitWeight === 0) {
    if (isForm) {
      const rangeInput = document.getElementById("newCustomRangeweight");
      rangeInput.setCustomValidity("규격 당 무게는 0이 될 수 없습니다.");
      rangeInput.reportValidity();
    } else {
      swal(
        "잘못된 값",
        "규격 당 무게는 0이 될 수 없습니다. 올바른 값을 입력해주세요.",
        "error"
      );
    }
    return false;
  }
  return true;
}

function saveMaterial() {
  if (selectedRowIndex === null) {
    swal(
      "선택 자재 없음",
      "자재 목록에서 변경하실 자재를 클릭해주세요!",
      "warning"
    );
    return;
  }

  const unitWeight = parseFloat(
    document.getElementById("customRangeweight").value
  );
  if (!validateUnitWeight(unitWeight)) {
    // 원래 값으로 되돌리기
    selectRow(selectedRowIndex);
    return;
  }

  const updatedMaterial = {
    materialName: document.getElementById("materialNameInput").value,
    modelName: document.getElementById("modelNameInput").value,
    manufacturer: document.getElementById("manufacturerInput").value,
    category: document.getElementById("categorySelectDetail").value,
    unit: document.getElementById("unitSelect").value,
    unitWeight: unitWeight,
    storageMethod: document.getElementById("storageMethodSelect").value,
    usage: document.getElementById("usageInput").value,
  };

  const originalMaterial = materialArray[selectedRowIndex];

  // 현재 값과 배열의 값을 비교하여 동일한지 확인
  let isSame = true;
  Object.keys(updatedMaterial).forEach((key) => {
    if (updatedMaterial[key] != originalMaterial[key]) {
      console.log(
        `Difference found in key: ${key}, Updated: ${updatedMaterial[key]}, Original: ${originalMaterial[key]}`
      );
      isSame = false;
    }
  });

  if (isSame) {
    swal(
      "변경 없음",
      "입력된 값이 기존 값과 동일합니다.\n변경할 내용을 입력해주세요.",
      "warning"
    );
    return;
  }

  materialArray[selectedRowIndex] = updatedMaterial;
  // 테이블 update
  populateTable(materialArray);
  swal("변경 완료", "선택하신 자재 변경이 완료되었습니다!", "success");
}

function searchItem() {
  const modelName = document
    .getElementById("searchModelName")
    .value.toLowerCase();
  const materialName = document
    .getElementById("searchMaterialName")
    .value.toLowerCase();
  const manufacturer = document
    .getElementById("searchManufacturer")
    .value.toLowerCase();
  const category = document.getElementById("categorySelect").value;

  const filteredData = materialArray.filter((material) => {
    let match = true;

    if (
      materialName &&
      !material.materialName.toLowerCase().includes(materialName)
    ) {
      match = false;
    }

    if (modelName && !material.modelName.toLowerCase().includes(modelName)) {
      match = false;
    }

    if (
      manufacturer &&
      !material.manufacturer.toLowerCase().includes(manufacturer)
    ) {
      match = false;
    }

    if (
      category &&
      category !== "카테고리 선택" &&
      category !== "전체" &&
      material.category !== category
    ) {
      match = false;
    }

    return match;
  });

  populateTable(filteredData);
}

function createMaterial() {
  const form = document.getElementById("createMaterialForm");
  const rangeInput = document.getElementById("newCustomRangeweight");
  rangeInput.setCustomValidity(""); // 초기화

  const unitWeight = parseFloat(rangeInput.value);
  if (!validateUnitWeight(unitWeight, true)) {
    form.classList.add("was-validated");
    return;
  }

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const newMaterial = {
    materialName: document.getElementById("newMaterialNameInput").value,
    modelName: document.getElementById("newModelNameInput").value,
    manufacturer: document.getElementById("newManufacturerInput").value,
    category: document.querySelector("#newCategorySelect").value,
    unit: document.querySelector("#newUnitSelect").value,
    unitWeight: unitWeight,
    storageMethod: document.getElementById("newStorageMethodSelect").value,
    usage: document.getElementById("newUsageInput").value,
  };

  materialArray.push(newMaterial);
  populateTable(materialArray);

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("createMaterialModal")
  );
  modal.hide();

  // 폼 초기화
  form.reset();
  form.classList.remove("was-validated");
}
