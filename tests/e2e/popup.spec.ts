import { expect, test } from "./fixtures"
import { openPopup } from "./pages/popup"

const TEST_TEMPLATE = `
<!-- Test template -->
{{#each hunkList}}
\`\`\`{{langId}} {{#if @first}}filePath={{{filePath}}} {{/if}}newStart={{newStart}} oldStart={{oldStart}}
{{{code}}}
\`\`\`
{{/each}}
`

test.describe("ポップアップ", () => {
  test("テンプレートが表示される", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // 初期状態を確認
    await expect(popup.getNoTemplatesMessage()).toBeVisible()

    // テンプレートを作成
    await popup.createTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートが表示されていることを確認
    await expect(popup.getTemplateListItem("Test Template")).toBeVisible()
  })

  test("テンプレートを作成できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // テンプレートを作成
    await popup.createTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートが作成されていることを確認
    await expect(popup.getTemplateListItem("Test Template")).toBeVisible()
  })

  test("テンプレートの作成をキャンセルできる", async ({
    page,
    extensionId,
  }) => {
    const popup = await openPopup(page, extensionId)

    // テンプレートの作成をキャンセル
    await popup.cancelCreateTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートが作成されていないことを確認
    await expect(popup.getTemplateListItem("Test Template")).not.toBeVisible()
    await expect(popup.getNoTemplatesMessage()).toBeVisible()
  })

  test("テンプレートを編集できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // テンプレートを作成
    await popup.createTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートを編集
    await popup.editTemplate(
      "Test Template",
      "Test Template Updated",
      TEST_TEMPLATE,
    )

    // テンプレートが更新されていることを確認
    await expect(
      popup.getTemplateListItem("Test Template Updated"),
    ).toBeVisible()
  })

  test("テンプレートの編集をキャンセルできる", async ({
    page,
    extensionId,
  }) => {
    const popup = await openPopup(page, extensionId)

    // テンプレートを作成
    await popup.createTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートの編集をキャンセル
    await popup.cancelEditTemplate(
      "Test Template",
      "Test Template Updated",
      TEST_TEMPLATE,
    )

    // テンプレートが更新されていないことを確認
    await expect(popup.getTemplateListItem("Test Template")).toBeVisible()
    await expect(
      popup.getTemplateListItem("Test Template Updated"),
    ).not.toBeVisible()
  })

  test("テンプレートを削除できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // テンプレートを作成
    await popup.createTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートが作成されていることを確認
    await expect(popup.getTemplateListItem("Test Template")).toBeVisible()

    // テンプレートを削除
    await popup.deleteTemplate("Test Template")

    // テンプレートが削除されていることを確認
    await expect(popup.getTemplateListItem("Test Template")).not.toBeVisible()
    await expect(popup.getNoTemplatesMessage()).toBeVisible()
  })

  test("テンプレートの削除をキャンセルできる", async ({
    page,
    extensionId,
  }) => {
    const popup = await openPopup(page, extensionId)

    // テンプレートを作成
    await popup.createTemplate("Test Template", TEST_TEMPLATE)

    // テンプレートの削除をキャンセル
    await popup.cancelDeleteTemplate("Test Template")

    // テンプレートが削除されていないことを確認
    await expect(popup.getTemplateListItem("Test Template")).toBeVisible()
  })

  test("デフォルトのテンプレートを設定できる", async ({
    page,
    extensionId,
  }) => {
    const popup = await openPopup(page, extensionId)

    // 複数のテンプレートを作成
    await popup.createTemplate("Test Template A", TEST_TEMPLATE)
    await popup.createTemplate("Test Template B", TEST_TEMPLATE)

    // Test Template B をデフォルトに設定
    await popup.clickSetAsDefaultButton("Test Template B")

    // Test Template B がデフォルトに設定されていることを確認
    await expect(popup.getTemplateListItem("Test Template A")).toHaveAttribute(
      "data-default",
      "false",
    )
    await expect(popup.getTemplateListItem("Test Template B")).toHaveAttribute(
      "data-default",
      "true",
    )
  })

  test("作成時にデフォルトとして設定できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // デフォルトとして作成
    await popup.createTemplate("Default Template", TEST_TEMPLATE, true)

    // デフォルトに設定されていることを確認
    await expect(popup.getTemplateListItem("Default Template")).toHaveAttribute(
      "data-default",
      "true",
    )

    // 通常のテンプレートを作成（デフォルト設定を変更しない）
    await popup.createTemplate("Normal Template", TEST_TEMPLATE, false)

    // デフォルトが変更されていないことを確認
    await expect(popup.getTemplateListItem("Default Template")).toHaveAttribute(
      "data-default",
      "true",
    )
    await expect(popup.getTemplateListItem("Normal Template")).toHaveAttribute(
      "data-default",
      "false",
    )
  })

  test("編集時にデフォルトとして設定できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // 通常のテンプレートを作成
    await popup.createTemplate("Test Template A", TEST_TEMPLATE)
    await popup.createTemplate("Test Template B", TEST_TEMPLATE)

    // Test Template B を編集してデフォルトに設定
    await popup.editTemplate(
      "Test Template B",
      "Test Template B Updated",
      TEST_TEMPLATE,
      true,
    )

    // Test Template B がデフォルトに設定されていることを確認
    await expect(popup.getTemplateListItem("Test Template A")).toHaveAttribute(
      "data-default",
      "false",
    )
    await expect(
      popup.getTemplateListItem("Test Template B Updated"),
    ).toHaveAttribute("data-default", "true")
  })

  test("編集時にデフォルトを解除できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // デフォルトテンプレートを作成
    await popup.createTemplate("Default Template", TEST_TEMPLATE, true)

    // デフォルトに設定されていることを確認
    await expect(popup.getTemplateListItem("Default Template")).toHaveAttribute(
      "data-default",
      "true",
    )

    // デフォルトを解除
    await popup.editTemplate(
      "Default Template",
      "Default Template",
      TEST_TEMPLATE,
      false,
    )

    // デフォルトが解除されていることを確認
    await expect(popup.getTemplateListItem("Default Template")).toHaveAttribute(
      "data-default",
      "false",
    )
  })

  test("複数のテンプレートを管理できる", async ({ page, extensionId }) => {
    const popup = await openPopup(page, extensionId)

    // 初期状態を確認
    await expect(popup.getNoTemplatesMessage()).toBeVisible()

    // 複数のテンプレートを作成
    await popup.createTemplate("Test Template A", TEST_TEMPLATE)
    await popup.createTemplate("Test Template B", TEST_TEMPLATE)

    // 複数のテンプレートが作成されていることを確認
    await expect(popup.getTemplateListItem("Test Template A")).toBeVisible()
    await expect(popup.getTemplateListItem("Test Template B")).toBeVisible()

    // Test Template B を削除
    await popup.deleteTemplate("Test Template B")

    // Test Template B が削除されていることを確認
    await expect(popup.getTemplateListItem("Test Template A")).toBeVisible()
    await expect(popup.getTemplateListItem("Test Template B")).not.toBeVisible()
  })
})
