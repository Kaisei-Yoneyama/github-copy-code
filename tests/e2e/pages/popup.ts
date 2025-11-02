import type { Page } from "@playwright/test"

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await page.waitForLoadState("networkidle")

  return {
    // MARK: - 要素取得

    getTemplateList() {
      return page.locator('[role="list"][aria-label="Template list"]')
    },

    getTemplateListItem(templateName: string) {
      return page.locator(
        `[role="listitem"][aria-label="Template: ${templateName}"]`,
      )
    },

    getNoTemplatesMessage() {
      return page.getByRole("heading", { name: "No templates yet" })
    },

    // MARK: - 主要操作

    async createTemplate(name: string, source: string, isDefault = false) {
      await this.clickNewButton()
      await this.waitForFormDialog()
      await this.fillTemplateNameInput(name)
      await this.fillTemplateSourceTextArea(source)
      if (isDefault) {
        await this.checkDefaultCheckbox()
      }
      await this.clickCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async editTemplate(
      templateName: string,
      newName: string,
      newSource: string,
      isDefault?: boolean,
    ) {
      await this.clickEditButton(templateName)
      await this.waitForFormDialog()
      await this.fillTemplateNameInput(newName)
      await this.fillTemplateSourceTextArea(newSource)
      if (isDefault !== undefined) {
        if (isDefault) {
          await this.checkDefaultCheckbox()
        } else {
          await this.uncheckDefaultCheckbox()
        }
      }
      await this.clickCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async deleteTemplate(templateName: string) {
      await this.clickDeleteButton(templateName)
      await this.waitForConfirmDialog()
      await this.clickConfirmDeleteButton()
      await this.waitForConfirmDialogToClose()
    },

    async cancelCreateTemplate(name?: string, source?: string) {
      await this.clickNewButton()
      await this.waitForFormDialog()
      if (name) await this.fillTemplateNameInput(name)
      if (source) await this.fillTemplateSourceTextArea(source)
      await this.clickCancelCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async cancelEditTemplate(
      templateName: string,
      newName?: string,
      newSource?: string,
    ) {
      await this.clickEditButton(templateName)
      await this.waitForFormDialog()
      if (newName) await this.fillTemplateNameInput(newName)
      if (newSource) await this.fillTemplateSourceTextArea(newSource)
      await this.clickCancelCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async cancelDeleteTemplate(templateName: string) {
      await this.clickDeleteButton(templateName)
      await this.waitForConfirmDialog()
      await this.clickCancelDeleteButton()
      await this.waitForConfirmDialogToClose()
    },

    // MARK: - ボタン操作

    async clickNewButton() {
      await page.getByRole("button", { name: "New template" }).click()
    },

    async clickEditButton(templateName: string) {
      const template = this.getTemplateListItem(templateName)
      await template.getByRole("button", { name: "Edit template" }).click()
    },

    async clickDeleteButton(templateName: string) {
      const template = this.getTemplateListItem(templateName)
      await template.getByRole("button", { name: "Delete template" }).click()
    },

    async clickSetAsDefaultButton(templateName: string) {
      const template = this.getTemplateListItem(templateName)
      await template
        .getByRole("button", { name: "Set as default template" })
        .click()
    },

    async clickCreateOrUpdateButton() {
      await page.locator('button[type="submit"]').click()
    },

    async clickCancelCreateOrUpdateButton() {
      await page.getByRole("button", { name: "Cancel" }).click()
    },

    async clickConfirmDeleteButton() {
      await page
        .locator('[role="alertdialog"] button:has-text("Delete")')
        .click()
    },

    async clickCancelDeleteButton() {
      await page
        .locator('[role="alertdialog"] button:has-text("Cancel")')
        .click()
    },

    // MARK: - フォーム入力

    async fillTemplateNameInput(name: string) {
      const nameInput = page.locator('input[name="name"]')
      await nameInput.fill(name)
    },

    async fillTemplateSourceTextArea(source: string) {
      const sourceTextarea = page.locator('textarea[name="source"]')
      await sourceTextarea.fill(source)
    },

    async checkDefaultCheckbox() {
      const checkbox = page.locator('input[name="default"]')
      await checkbox.check()
    },

    async uncheckDefaultCheckbox() {
      const checkbox = page.locator('input[name="default"]')
      await checkbox.uncheck()
    },

    isDefaultCheckboxChecked() {
      return page.locator('input[name="default"]').isChecked()
    },

    // MARK: - 待機処理

    async waitForFormDialog(timeout = 3000) {
      await page.locator('[role="dialog"]').waitFor({
        state: "visible",
        timeout,
      })
    },

    async waitForFormDialogToClose(timeout = 3000) {
      await page.locator('[role="dialog"]').waitFor({
        state: "hidden",
        timeout,
      })
    },

    async waitForConfirmDialog(timeout = 3000) {
      await page.locator('[role="alertdialog"]').waitFor({
        state: "visible",
        timeout,
      })
    },

    async waitForConfirmDialogToClose(timeout = 3000) {
      await page.locator('[role="alertdialog"]').waitFor({
        state: "hidden",
        timeout,
      })
    },
  }
}
