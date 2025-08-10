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

    async createTemplate(name: string, content: string) {
      await this.clickNewButton()
      await this.waitForFormDialog()
      await this.fillTemplateNameInput(name)
      await this.fillTemplateContentTextArea(content)
      await this.clickCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async editTemplate(
      templateName: string,
      newName: string,
      newContent: string,
    ) {
      await this.clickEditButton(templateName)
      await this.waitForFormDialog()
      await this.fillTemplateNameInput(newName)
      await this.fillTemplateContentTextArea(newContent)
      await this.clickCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async deleteTemplate(templateName: string) {
      await this.clickDeleteButton(templateName)
      await this.waitForConfirmDialog()
      await this.clickConfirmDeleteButton()
      await this.waitForConfirmDialogToClose()
    },

    async cancelCreateTemplate(name?: string, content?: string) {
      await this.clickNewButton()
      await this.waitForFormDialog()
      if (name) await this.fillTemplateNameInput(name)
      if (content) await this.fillTemplateContentTextArea(content)
      await this.clickCancelCreateOrUpdateButton()
      await this.waitForFormDialogToClose()
    },

    async cancelEditTemplate(
      templateName: string,
      newName?: string,
      newContent?: string,
    ) {
      await this.clickEditButton(templateName)
      await this.waitForFormDialog()
      if (newName) await this.fillTemplateNameInput(newName)
      if (newContent) await this.fillTemplateContentTextArea(newContent)
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

    async fillTemplateContentTextArea(content: string) {
      const contentTextarea = page.locator('textarea[name="content"]')
      await contentTextarea.fill(content)
    },

    // MARK: - 待機処理

    async waitForFormDialog(timeout = 500) {
      await page.locator('[role="dialog"]').waitFor({
        state: "visible",
        timeout,
      })
    },

    async waitForFormDialogToClose(timeout = 500) {
      await page.locator('[role="dialog"]').waitFor({
        state: "hidden",
        timeout,
      })
    },

    async waitForConfirmDialog(timeout = 500) {
      await page.locator('[role="alertdialog"]').waitFor({
        state: "visible",
        timeout,
      })
    },

    async waitForConfirmDialogToClose(timeout = 500) {
      await page.locator('[role="alertdialog"]').waitFor({
        state: "hidden",
        timeout,
      })
    },
  }
}
